"""
Training script V7:
- Uses CircuitTransformerV2 (constrained decoder)
- Uses LossV3 with derivative matching
- Computes impedance of predicted circuits for shape loss
- Slower tau annealing (floor at 0.7)
- Early stopping on val_loss
- Stronger regularization
"""
import argparse
import os
import sys
import json
from pathlib import Path
from datetime import datetime

import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset, random_split
from tqdm import tqdm
import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent))

from models.model_v2 import CircuitTransformerV2
from training.loss_v3_fast import CircuitLossV3Fast as CircuitLossV3
from training.solver_gpu_v4 import compute_impedance_gpu_v4 as compute_impedance_gpu
from config import (
    LATENT_DIM, D_MODEL, N_HEAD, N_LAYERS,
    COMP_R, COMP_L, COMP_C, MAX_NODES, TOKEN_START, TOKEN_END,
    FREQUENCIES, NUM_FREQ
)


def sequence_to_components(seq, value_center={1: 3.0, 2: -4.0, 3: -8.0}):
    """Convert sequence tensor to component list."""
    components = []
    for row in seq:
        comp_type = int(row[0].item())
        if comp_type not in [COMP_R, COMP_L, COMP_C]:
            continue
        node_a = int(row[1].item())
        node_b = int(row[2].item())
        if node_a == node_b:
            continue
        log_value = row[3].item() + value_center.get(comp_type, 0)
        value = 10 ** log_value
        components.append({
            'type_id': comp_type,
            'node_a': node_a,
            'node_b': node_b,
            'value': value
        })
    return components


def compute_impedance_batch(sequences, freqs):
    """Compute impedance for a batch of sequences. Returns (batch, 2, num_freq)."""
    batch_size = sequences.shape[0]
    num_freq = len(freqs)
    omega = 2 * np.pi * freqs
    
    result = torch.zeros(batch_size, 2, num_freq)
    
    for b in range(batch_size):
        components = sequence_to_components(sequences[b])
        if not components:
            # Default: high impedance flat line
            result[b, 0, :] = 6.0  # log10(1e6)
            result[b, 1, :] = 0.0
            continue
        
        # MNA solver
        max_node = max(max(c['node_a'], c['node_b']) for c in components)
        num_nodes = max_node + 1
        
        Z_in = np.zeros(num_freq, dtype=complex)
        
        for f_idx, w in enumerate(omega):
            n_reduced = num_nodes - 1
            if n_reduced < 1:
                Z_in[f_idx] = 1e6
                continue
            
            Y = np.zeros((n_reduced, n_reduced), dtype=complex)
            
            for comp in components:
                ctype = comp['type_id']
                val = comp['value']
                
                if ctype == COMP_R:
                    y = 1.0 / val if val > 0 else 0
                elif ctype == COMP_L:
                    y = 1.0 / (1j * w * val + 1e-15)
                elif ctype == COMP_C:
                    y = 1j * w * val
                else:
                    continue
                
                i, j = comp['node_a'], comp['node_b']
                
                if i > 0 and j > 0:
                    idx_i, idx_j = i - 1, j - 1
                    Y[idx_i, idx_i] += y
                    Y[idx_j, idx_j] += y
                    Y[idx_i, idx_j] -= y
                    Y[idx_j, idx_i] -= y
                elif i == 0:
                    idx_j = j - 1
                    Y[idx_j, idx_j] += y
                else:
                    idx_i = i - 1
                    Y[idx_i, idx_i] += y
            
            I = np.zeros(n_reduced, dtype=complex)
            I[0] = 1.0
            
            try:
                V = np.linalg.solve(Y, I)
                Z_in[f_idx] = V[0] if abs(V[0]) < 1e10 else 1e6
            except:
                Z_in[f_idx] = 1e6
        
        result[b, 0, :] = torch.tensor(np.log10(np.abs(Z_in) + 1e-10))
        result[b, 1, :] = torch.tensor(np.angle(Z_in))
    
    return result


def create_dataloaders(data_path, batch_size=64, val_ratio=0.1, test_ratio=0.1):
    """Load dataset and create dataloaders."""
    data = torch.load(data_path, weights_only=False)
    impedances = data['impedances']
    sequences = data['sequences']
    
    dataset = TensorDataset(impedances, sequences)
    
    n = len(dataset)
    n_test = int(n * test_ratio)
    n_val = int(n * val_ratio)
    n_train = n - n_val - n_test
    
    train_ds, val_ds, test_ds = random_split(dataset, [n_train, n_val, n_test])
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=4, pin_memory=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=4)
    
    return train_loader, val_loader, test_loader


def train_epoch(model, loader, optimizer, loss_fn, device, tau, freqs, use_impedance_loss=True):
    """Train one epoch with optional impedance reconstruction loss."""
    model.train()
    model.tau = tau
    
    total_loss = 0
    total_type_acc = 0
    total_selfloop = 0
    total_d1_loss = 0
    n_batches = 0
    
    pbar = tqdm(loader, desc="Training", leave=False)
    
    for batch_data in pbar:
        impedance, sequence = batch_data
        impedance = impedance.to(device)
        sequence = sequence.to(device)
        
        optimizer.zero_grad()
        
        output = model(impedance, teacher_seq=sequence, hard=False)
        
        # Compute impedance of predicted circuits (expensive)
        pred_impedance = None
        if use_impedance_loss:
            with torch.no_grad():
                pred_seq = output['sequence'].detach().cpu()
                pred_impedance = compute_impedance_gpu(output["sequence"])  # GPU direct
        
        losses = loss_fn(output, sequence, impedance, pred_impedance)
        
        losses['total'].backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        
        # Metrics
        total_loss += losses['total'].item()
        
        pred_types = output['type_logits'].argmax(dim=-1)
        target_types = sequence[:, :, 0].long()
        mask = (target_types >= COMP_R) & (target_types <= COMP_C)
        if mask.sum() > 0:
            total_type_acc += (pred_types[mask] == target_types[mask]).float().mean().item()
        
        total_selfloop += losses['selfloop'].item()
        total_d1_loss += losses['d1'].item()
        n_batches += 1
        
        pbar.set_postfix({
            'loss': f"{losses['total'].item():.3f}",
            'type': f"{total_type_acc/n_batches*100:.1f}%",
            'd1': f"{losses['d1'].item():.4f}"
        })
    
    return {
        'loss': total_loss / n_batches,
        'type_acc': total_type_acc / n_batches,
        'selfloop': total_selfloop / n_batches,
        'd1_loss': total_d1_loss / n_batches
    }


def validate(model, loader, loss_fn, device, tau, freqs):
    """Validate model."""
    model.eval()
    model.tau = tau
    
    total_loss = 0
    total_type_acc = 0
    total_d1_loss = 0
    n_batches = 0
    
    with torch.no_grad():
        for batch_data in loader:
            impedance, sequence = batch_data
            impedance = impedance.to(device)
            sequence = sequence.to(device)
            
            output = model(impedance, teacher_seq=sequence, hard=True)
            
            # Compute impedance of predicted circuits
            pred_seq = output['sequence'].cpu()
            pred_impedance = compute_impedance_gpu(output["sequence"])  # GPU direct
            
            losses = loss_fn(output, sequence, impedance, pred_impedance)
            
            total_loss += losses['total'].item()
            total_d1_loss += losses['d1'].item()
            
            pred_types = output['type_logits'].argmax(dim=-1)
            target_types = sequence[:, :, 0].long()
            mask = (target_types >= COMP_R) & (target_types <= COMP_C)
            if mask.sum() > 0:
                total_type_acc += (pred_types[mask] == target_types[mask]).float().mean().item()
            
            n_batches += 1
    
    return {
        'loss': total_loss / n_batches,
        'type_acc': total_type_acc / n_batches,
        'd1_loss': total_d1_loss / n_batches
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, default='outputs/dataset_v4.pt')
    parser.add_argument('--output-dir', type=str, default='outputs/training_v7')
    parser.add_argument('--epochs', type=int, default=100)
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--lr', type=float, default=1e-4)
    parser.add_argument('--weight-decay', type=float, default=1e-4)  # Regularization
    parser.add_argument('--tau-start', type=float, default=1.0)
    parser.add_argument('--tau-end', type=float, default=0.7)  # Floor higher than before
    parser.add_argument('--patience', type=int, default=15)  # Early stopping
    parser.add_argument('--d1-weight', type=float, default=0.5)
    parser.add_argument('--d2-weight', type=float, default=0.3)
    args = parser.parse_args()
    
    # Setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")
    if device.type == 'cuda':
        print(f"GPU: {torch.cuda.get_device_name()}")
    
    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs(f"{args.output_dir}/checkpoints", exist_ok=True)
    
    # Data
    print(f"\nLoading data from {args.data}")
    train_loader, val_loader, test_loader = create_dataloaders(
        args.data, batch_size=args.batch_size
    )
    print(f"Dataset: train={len(train_loader.dataset)}, val={len(val_loader.dataset)}, test={len(test_loader.dataset)}")
    
    # Model with dropout
    model = CircuitTransformerV2(
        latent_dim=LATENT_DIM,
        d_model=D_MODEL,
        nhead=N_HEAD,
        num_layers=N_LAYERS
    ).to(device)
    print(f"\nModel V2 parameters: {model.count_parameters():,}")
    
    # Loss V3
    loss_fn = CircuitLossV3(
        d1_weight=args.d1_weight,
        d2_weight=args.d2_weight
    )
    print(f"Loss V3 weights: d1={args.d1_weight}, d2={args.d2_weight}")
    
    # Optimizer with weight decay
    optimizer = optim.AdamW(
        model.parameters(), 
        lr=args.lr, 
        weight_decay=args.weight_decay
    )
    
    # LR scheduler
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5
    )
    
    # Frequencies for impedance computation
    freqs = FREQUENCIES
    
    print(f"\n{'='*60}")
    print(f"Training V7 (Derivative Loss + Slower Tau + Early Stopping)")
    print(f"{'='*60}\n")
    
    best_val_loss = float('inf')
    patience_counter = 0
    history = []
    
    for epoch in range(1, args.epochs + 1):
        # Slower tau annealing with floor
        tau = max(args.tau_end, args.tau_start - (args.tau_start - args.tau_end) * epoch / args.epochs)
        
        # Train (use impedance loss every epoch, but could skip some for speed)
        use_imp_loss = True  # Always use derivative loss
        train_metrics = train_epoch(model, train_loader, optimizer, loss_fn, device, tau, freqs, use_imp_loss)
        
        # Validate
        val_metrics = validate(model, val_loader, loss_fn, device, tau, freqs)
        
        # LR scheduling
        scheduler.step(val_metrics['loss'])
        
        # Logging
        print(f"Epoch {epoch:3d}/{args.epochs} | tau={tau:.2f} | "
              f"Loss: {train_metrics['loss']:.3f}/{val_metrics['loss']:.3f} | "
              f"Type: {train_metrics['type_acc']*100:.1f}%/{val_metrics['type_acc']*100:.1f}% | "
              f"D1: {train_metrics['d1_loss']:.4f}/{val_metrics['d1_loss']:.4f}")
        
        history.append({
            'epoch': epoch,
            'tau': tau,
            'train_loss': train_metrics['loss'],
            'val_loss': val_metrics['loss'],
            'train_type_acc': train_metrics['type_acc'],
            'val_type_acc': val_metrics['type_acc'],
            'train_d1': train_metrics['d1_loss'],
            'val_d1': val_metrics['d1_loss']
        })
        
        # Checkpointing
        if val_metrics['loss'] < best_val_loss:
            best_val_loss = val_metrics['loss']
            patience_counter = 0
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_loss': val_metrics['loss'],
                'tau': tau
            }, f"{args.output_dir}/checkpoints/best.pt")
            print(f"  -> Best model saved!")
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                print(f"\nEarly stopping at epoch {epoch} (patience={args.patience})")
                break
        
        # Periodic checkpoint
        if epoch % 10 == 0:
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'val_loss': val_metrics['loss']
            }, f"{args.output_dir}/checkpoints/epoch_{epoch}.pt")
    
    # Save history
    with open(f"{args.output_dir}/history.json", 'w') as f:
        json.dump(history, f, indent=2)
    
    print(f"\nTraining complete! Best val_loss: {best_val_loss:.4f}")
    print(f"Model saved to {args.output_dir}/checkpoints/best.pt")


if __name__ == "__main__":
    main()
