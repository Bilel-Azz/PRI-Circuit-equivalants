"""
Training script V4:
- Uses CircuitTransformerV2 (constrained node_b != node_a)
- Uses LossV2 (with validity penalties)
"""
import argparse
import os
import sys
import json
from pathlib import Path
from datetime import datetime

import torch
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset, random_split
from tqdm import tqdm

sys.path.insert(0, str(Path(__file__).parent.parent))

from models.model_v2 import CircuitTransformerV2
from training.loss_v2 import CircuitLossV2
from config import (
    LATENT_DIM, D_MODEL, N_HEAD, N_LAYERS,
    COMP_R, COMP_L, COMP_C, MAX_NODES, TOKEN_START, TOKEN_END
)


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


def train_epoch(model, loader, optimizer, loss_fn, device, tau):
    """Train one epoch."""
    model.train()
    model.tau = tau
    
    total_metrics = {}
    pbar = tqdm(loader, desc="Training", leave=False)
    
    for batch_data in pbar:
        impedance, sequence = batch_data
        impedance = impedance.to(device)
        sequence = sequence.to(device)
        
        optimizer.zero_grad()
        
        output = model(impedance, teacher_seq=sequence, hard=False)
        loss, metrics = loss_fn(output, {'sequence': sequence})
        
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
        optimizer.step()
        
        for k, v in metrics.items():
            total_metrics[k] = total_metrics.get(k, 0) + v
        
        pbar.set_postfix({
            'loss': f"{metrics['loss']:.3f}",
            'type': f"{metrics['type_acc']:.1f}%",
            'sl': f"{metrics['selfloop_pen']:.3f}"
        })
    
    n_batches = len(loader)
    return {k: v / n_batches for k, v in total_metrics.items()}


def validate(model, loader, loss_fn, device, tau):
    """Validate."""
    model.eval()
    model.tau = tau
    
    total_metrics = {}
    
    with torch.no_grad():
        for batch_data in tqdm(loader, desc="Validating", leave=False):
            impedance, sequence = batch_data
            impedance = impedance.to(device)
            sequence = sequence.to(device)
            
            output = model(impedance, teacher_seq=sequence, hard=False)
            _, metrics = loss_fn(output, {'sequence': sequence})
            
            for k, v in metrics.items():
                total_metrics[k] = total_metrics.get(k, 0) + v
    
    n_batches = len(loader)
    return {k: v / n_batches for k, v in total_metrics.items()}


def test_validity(model, loader, device, num_samples=100):
    """Test validity rate of generated circuits."""
    model.eval()
    
    stats = {'valid': 0, 'invalid': 0, 'empty': 0, 'reasons': {}}
    samples_checked = 0
    
    with torch.no_grad():
        for batch_data in loader:
            impedance, _ = batch_data
            impedance = impedance.to(device)
            
            sequences = model.generate(impedance, tau=0.5)
            
            for seq in sequences:
                seq_np = seq.cpu().numpy()
                
                # Extract components
                components = []
                for row in seq_np:
                    if int(row[0]) in [COMP_R, COMP_L, COMP_C]:
                        components.append({
                            'type_id': int(row[0]),
                            'node_a': int(row[1]),
                            'node_b': int(row[2])
                        })
                
                if not components:
                    stats['empty'] += 1
                    samples_checked += 1
                    if samples_checked >= num_samples:
                        break
                    continue
                
                # Check validity
                is_valid = True
                reason = None
                
                # Self-loops
                for c in components:
                    if c['node_a'] == c['node_b']:
                        is_valid = False
                        reason = 'self-loop'
                        break
                
                # Duplicates
                if is_valid:
                    edges = set()
                    for c in components:
                        edge = tuple(sorted([c['node_a'], c['node_b']]))
                        if edge in edges:
                            is_valid = False
                            reason = 'duplicate'
                            break
                        edges.add(edge)
                
                # GND and IN
                if is_valid:
                    nodes = set()
                    for c in components:
                        nodes.add(c['node_a'])
                        nodes.add(c['node_b'])
                    if 0 not in nodes or 1 not in nodes:
                        is_valid = False
                        reason = 'missing-0-or-1'
                
                # Dead-ends
                if is_valid:
                    adj = {}
                    for c in components:
                        na, nb = c['node_a'], c['node_b']
                        adj.setdefault(na, set()).add(nb)
                        adj.setdefault(nb, set()).add(na)
                    for node in nodes:
                        if node not in [0, 1] and len(adj.get(node, set())) < 2:
                            is_valid = False
                            reason = 'dead-end'
                            break
                
                if is_valid:
                    stats['valid'] += 1
                else:
                    stats['invalid'] += 1
                    stats['reasons'][reason] = stats['reasons'].get(reason, 0) + 1
                
                samples_checked += 1
                if samples_checked >= num_samples:
                    break
            
            if samples_checked >= num_samples:
                break
    
    return stats


def main():
    parser = argparse.ArgumentParser(description="Train Circuit Transformer V4")
    parser.add_argument("--data", type=str, required=True, help="Path to dataset")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--latent-dim", type=int, default=256)
    parser.add_argument("--d-model", type=int, default=512)
    parser.add_argument("--nhead", type=int, default=8)
    parser.add_argument("--num-layers", type=int, default=6)
    parser.add_argument("--selfloop-weight", type=float, default=2.0)
    parser.add_argument("--duplicate-weight", type=float, default=1.0)
    parser.add_argument("--gnd-in-weight", type=float, default=0.5)
    parser.add_argument("--output-dir", type=str, default="outputs/training_v4")
    parser.add_argument("--save-every", type=int, default=10)
    args = parser.parse_args()
    
    # Setup
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    
    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs(os.path.join(args.output_dir, "checkpoints"), exist_ok=True)
    
    # Data
    print(f"\nLoading data from {args.data}")
    train_loader, val_loader, test_loader = create_dataloaders(args.data, args.batch_size)
    print(f"Dataset: train={len(train_loader.dataset)}, val={len(val_loader.dataset)}, test={len(test_loader.dataset)}")
    
    # Model V2
    model = CircuitTransformerV2(
        latent_dim=args.latent_dim,
        d_model=args.d_model,
        nhead=args.nhead,
        num_layers=args.num_layers
    ).to(device)
    print(f"\nModel V2 parameters: {model.count_parameters():,}")
    
    # Loss V2
    loss_fn = CircuitLossV2(
        selfloop_weight=args.selfloop_weight,
        duplicate_weight=args.duplicate_weight,
        gnd_in_weight=args.gnd_in_weight
    )
    print(f"\nLoss V2 weights: selfloop={args.selfloop_weight}, duplicate={args.duplicate_weight}, gnd_in={args.gnd_in_weight}")
    
    # Optimizer
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=args.lr * 0.01)
    
    # Training
    history = {'train_loss': [], 'val_loss': [], 'train_type_acc': [], 'val_type_acc': [],
               'selfloop_pen': [], 'duplicate_pen': [], 'validity_rate': []}
    best_val_loss = float('inf')
    
    print(f"\n{'='*60}")
    print(f"Training V4 (Constrained Decoder + Validity Loss)")
    print(f"{'='*60}\n")
    
    for epoch in range(1, args.epochs + 1):
        # Tau annealing
        tau = max(0.3, 1.0 - (epoch - 1) / 50 * 0.7)
        
        # Train
        train_metrics = train_epoch(model, train_loader, optimizer, loss_fn, device, tau)
        
        # Validate
        val_metrics = validate(model, val_loader, loss_fn, device, tau)
        
        scheduler.step()
        
        # Log
        history['train_loss'].append(train_metrics['loss'])
        history['val_loss'].append(val_metrics['loss'])
        history['train_type_acc'].append(train_metrics['type_acc'])
        history['val_type_acc'].append(val_metrics['type_acc'])
        history['selfloop_pen'].append(val_metrics['selfloop_pen'])
        history['duplicate_pen'].append(val_metrics['duplicate_pen'])
        
        print(f"Epoch {epoch:3d}/{args.epochs} | tau={tau:.2f} | "
              f"Loss: {train_metrics['loss']:.3f}/{val_metrics['loss']:.3f} | "
              f"Type: {train_metrics['type_acc']:.1f}%/{val_metrics['type_acc']:.1f}% | "
              f"SL: {val_metrics['selfloop_pen']:.4f} | Dup: {val_metrics['duplicate_pen']:.4f}")
        
        # Test validity every 10 epochs
        if epoch % 10 == 0:
            stats = test_validity(model, val_loader, device, num_samples=50)
            validity_rate = stats['valid'] / (stats['valid'] + stats['invalid'] + stats['empty'] + 1e-8) * 100
            history['validity_rate'].append(validity_rate)
            print(f"  -> Validity: {stats['valid']}/50 ({validity_rate:.1f}%) | Reasons: {stats['reasons']}")
        
        # Save best
        if val_metrics['loss'] < best_val_loss:
            best_val_loss = val_metrics['loss']
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'val_loss': best_val_loss,
                'metrics': val_metrics
            }, os.path.join(args.output_dir, "checkpoints", "best.pt"))
            print(f"  -> Best model saved!")
        
        # Periodic save
        if epoch % args.save_every == 0:
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'metrics': val_metrics
            }, os.path.join(args.output_dir, "checkpoints", f"epoch_{epoch}.pt"))
    
    # Save final
    torch.save({
        'epoch': args.epochs,
        'model_state_dict': model.state_dict(),
        'metrics': val_metrics
    }, os.path.join(args.output_dir, "checkpoints", "final.pt"))
    
    # Save history
    with open(os.path.join(args.output_dir, "history.json"), 'w') as f:
        json.dump(history, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Training complete! Best val loss: {best_val_loss:.4f}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
