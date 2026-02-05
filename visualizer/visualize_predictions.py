#!/usr/bin/env python3
"""
Visualize Circuit Predictions from Model.

Loads a trained model, generates circuits from Z(f) curves,
and displays them graphically.

Usage:
    python visualize_predictions.py \
        --checkpoint ../circuit_transformer/outputs/run_50k/checkpoints/best.pt \
        --data ../circuit_transformer/outputs/dataset_50k.pt \
        --num-samples 5
"""
import argparse
import sys
from pathlib import Path

import torch
import numpy as np
import matplotlib.pyplot as plt

# Add circuit_transformer to path
sys.path.insert(0, str(Path(__file__).parent.parent / "circuit_transformer"))

from config import LATENT_DIM, D_MODEL, N_HEAD, N_LAYERS, NUM_FREQ, FREQ_MIN, FREQ_MAX
from models.model import CircuitTransformer
from circuit_drawer import Component, draw_circuit_graph, draw_circuit_schematic


def load_model(checkpoint_path: str, device: torch.device):
    """Load trained model."""
    model = CircuitTransformer(
        latent_dim=LATENT_DIM,
        d_model=D_MODEL,
        nhead=N_HEAD,
        num_layers=N_LAYERS
    ).to(device)

    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()

    print(f"Loaded model from epoch {checkpoint['epoch']}")
    return model


def sequence_to_components(seq: np.ndarray) -> list:
    """Convert model output sequence to Component list."""
    VALUE_CENTER = {1: 3.0, 2: -4.0, 3: -8.0}
    components = []

    for row in seq:
        comp_type = int(row[0])
        if comp_type not in [1, 2, 3]:  # Skip PAD, START, END
            continue

        node_a = int(row[1])
        node_b = int(row[2])
        normalized_value = row[3]
        log_value = normalized_value + VALUE_CENTER.get(comp_type, 0)
        value = 10 ** log_value

        components.append(Component(comp_type, node_a, node_b, value))

    return components


def plot_impedance(z_target: np.ndarray, z_pred: np.ndarray = None,
                   title: str = "Impedance", save_path: str = None):
    """Plot impedance curve."""
    freqs = np.logspace(np.log10(FREQ_MIN), np.log10(FREQ_MAX), NUM_FREQ)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    # Magnitude
    ax = axes[0]
    ax.semilogx(freqs, z_target[0], 'b-', linewidth=2, label='Target')
    if z_pred is not None:
        ax.semilogx(freqs, z_pred[0], 'r--', linewidth=2, label='Predicted')
    ax.set_xlabel('Frequency (Hz)')
    ax.set_ylabel('log10(|Z|)')
    ax.set_title('Magnitude')
    ax.legend()
    ax.grid(True, alpha=0.3)

    # Phase
    ax = axes[1]
    ax.semilogx(freqs, z_target[1] * 180 / np.pi, 'b-', linewidth=2, label='Target')
    if z_pred is not None:
        ax.semilogx(freqs, z_pred[1] * 180 / np.pi, 'r--', linewidth=2, label='Predicted')
    ax.set_xlabel('Frequency (Hz)')
    ax.set_ylabel('Phase (degrees)')
    ax.set_title('Phase')
    ax.legend()
    ax.grid(True, alpha=0.3)

    plt.suptitle(title, fontsize=12, fontweight='bold')
    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        print(f"Saved impedance plot to {save_path}")

    plt.show()
    return fig


def visualize_sample(model, impedance: torch.Tensor, target_seq: np.ndarray,
                     idx: int, output_dir: str, device: torch.device):
    """Visualize a single sample: impedance + circuits."""

    print(f"\n{'='*60}")
    print(f"Sample {idx}")
    print(f"{'='*60}")

    # Generate prediction
    with torch.no_grad():
        pred_seq = model.generate(impedance.unsqueeze(0).to(device), tau=0.5)
    pred_seq = pred_seq[0].cpu().numpy()

    # Convert to components
    target_components = sequence_to_components(target_seq)
    pred_components = sequence_to_components(pred_seq)

    print(f"\nTarget circuit ({len(target_components)} components):")
    for c in target_components:
        print(f"  {c.label} (nodes {c.node_a}-{c.node_b})")

    print(f"\nPredicted circuit ({len(pred_components)} components):")
    for c in pred_components:
        print(f"  {c.label} (nodes {c.node_a}-{c.node_b})")

    # Plot impedance
    z_target = impedance.numpy()
    plot_impedance(z_target, title=f"Sample {idx} - Target Impedance",
                   save_path=f"{output_dir}/sample_{idx}_impedance.png")

    # Draw target circuit
    if target_components:
        print("\nDrawing target circuit...")
        draw_circuit_schematic(
            target_components,
            title=f"Sample {idx} - Target Circuit",
            save_path=f"{output_dir}/sample_{idx}_target.png"
        )

    # Draw predicted circuit
    if pred_components:
        print("\nDrawing predicted circuit...")
        draw_circuit_schematic(
            pred_components,
            title=f"Sample {idx} - Predicted Circuit",
            save_path=f"{output_dir}/sample_{idx}_predicted.png"
        )
    else:
        print("\nNo valid components in prediction!")


def main():
    parser = argparse.ArgumentParser(description="Visualize Circuit Predictions")
    parser.add_argument('--checkpoint', type=str, required=True,
                        help='Path to model checkpoint')
    parser.add_argument('--data', type=str, required=True,
                        help='Path to dataset')
    parser.add_argument('--num-samples', type=int, default=5,
                        help='Number of samples to visualize')
    parser.add_argument('--output-dir', type=str, default='outputs',
                        help='Output directory for plots')
    parser.add_argument('--start-idx', type=int, default=None,
                        help='Starting index in test set')

    args = parser.parse_args()

    # Create output directory
    Path(args.output_dir).mkdir(parents=True, exist_ok=True)

    # Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")

    # Load model
    model = load_model(args.checkpoint, device)

    # Load data
    print(f"\nLoading data from {args.data}")
    data = torch.load(args.data)
    n_total = len(data['impedances'])
    test_start = int(n_total * 0.9)

    print(f"Dataset: {n_total} samples, test set starts at {test_start}")

    # Select samples
    if args.start_idx is not None:
        start_idx = args.start_idx
    else:
        start_idx = test_start

    # Visualize samples
    for i in range(args.num_samples):
        idx = start_idx + i
        if idx >= n_total:
            print(f"Reached end of dataset at idx {idx}")
            break

        impedance = data['impedances'][idx]
        target_seq = data['sequences'][idx].numpy()

        visualize_sample(model, impedance, target_seq, idx, args.output_dir, device)

    print(f"\n{'='*60}")
    print(f"Done! Outputs saved to {args.output_dir}/")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
