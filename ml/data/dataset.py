#!/usr/bin/env python3
"""Dataset generation and loading for Circuit Transformer."""
import os
import argparse
from typing import Dict, Optional, Tuple
from multiprocessing import Pool, cpu_count
import time

import torch
import numpy as np
from torch.utils.data import Dataset, DataLoader
from tqdm import tqdm

from config import (
    NUM_FREQ, MAX_SEQ_LEN, MAX_COMPONENTS, MAX_NODES,
    MIN_COMPONENTS, RLC_RATIO, DATASET_SIZE, BATCH_SIZE
)
from data.circuit import generate_random_circuit, circuit_to_sequence
from data.solver import compute_impedance


def generate_single_sample(args: Tuple) -> Optional[Dict]:
    """Generate one circuit sample. Returns numpy arrays to avoid multiprocessing issues."""
    idx, min_comp, max_comp, max_nodes, force_rlc = args

    try:
        circuit = generate_random_circuit(
            min_components=min_comp,
            max_components=max_comp,
            max_nodes=max_nodes,
            force_rlc=force_rlc
        )

        if len(circuit.components) == 0:
            return None

        impedance = compute_impedance(circuit)

        if not np.isfinite(impedance).all():
            return None

        sequence = circuit_to_sequence(circuit, MAX_SEQ_LEN)

        return {
            'impedance': impedance.astype(np.float32),
            'sequence': sequence.astype(np.float32)
        }

    except Exception:
        return None


def generate_dataset(
    num_samples: int = DATASET_SIZE,
    min_components: int = MIN_COMPONENTS,
    max_components: int = MAX_COMPONENTS,
    max_nodes: int = MAX_NODES,
    rlc_ratio: float = RLC_RATIO,
    num_workers: int = None,
    seed: int = 42,
    save_path: str = None
) -> Dict[str, torch.Tensor]:
    np.random.seed(seed)

    if num_workers is None:
        num_workers = max(1, cpu_count() - 1)

    print(f"Generating {num_samples:,} circuits...")
    print(f"  Components: {min_components}-{max_components}")
    print(f"  Max nodes: {max_nodes}")
    print(f"  RLC ratio: {rlc_ratio*100:.0f}%")
    print(f"  Workers: {num_workers}")
    print()

    args_list = []
    for i in range(num_samples):
        force_rlc = np.random.random() < rlc_ratio
        args_list.append((i, min_components, max_components, max_nodes, force_rlc))

    start_time = time.time()

    if num_workers > 1:
        with Pool(num_workers) as pool:
            results = list(tqdm(
                pool.imap(generate_single_sample, args_list, chunksize=100),
                total=num_samples,
                desc="Generating"
            ))
    else:
        results = [generate_single_sample(a) for a in tqdm(args_list)]

    valid = [r for r in results if r is not None]
    num_valid = len(valid)

    elapsed = time.time() - start_time
    print(f"\nGenerated {num_valid:,} valid samples ({num_valid/num_samples*100:.1f}%)")
    print(f"Time: {elapsed:.1f}s ({num_valid/elapsed:.0f} samples/sec)")

    impedances = torch.tensor(np.stack([r['impedance'] for r in valid]), dtype=torch.float32)
    sequences = torch.tensor(np.stack([r['sequence'] for r in valid]), dtype=torch.float32)

    dataset = {
        'impedances': impedances,
        'sequences': sequences
    }

    print(f"\nImpedances: {impedances.shape}")
    print(f"Sequences: {sequences.shape}")

    from config import TOKEN_PAD, TOKEN_START, TOKEN_END
    seq_types = sequences[:, :, 0]
    valid_mask = (seq_types != TOKEN_PAD) & (seq_types != TOKEN_START) & (seq_types != TOKEN_END)
    comp_counts = valid_mask.sum(dim=1)
    print(f"Components/circuit: min={comp_counts.min()}, max={comp_counts.max()}, mean={comp_counts.float().mean():.1f}")

    from config import COMP_R, COMP_L, COMP_C
    all_types = seq_types[valid_mask]
    r_count = (all_types == COMP_R).sum().item()
    l_count = (all_types == COMP_L).sum().item()
    c_count = (all_types == COMP_C).sum().item()
    total = r_count + l_count + c_count
    print(f"Type distribution: R={r_count/total*100:.1f}%, L={l_count/total*100:.1f}%, C={c_count/total*100:.1f}%")

    print(f"|Z| range: [{impedances[:, 0].min():.2f}, {impedances[:, 0].max():.2f}] log10(Ohm)")
    print(f"Phase range: [{impedances[:, 1].min():.2f}, {impedances[:, 1].max():.2f}] rad")

    if save_path:
        os.makedirs(os.path.dirname(save_path) or '.', exist_ok=True)
        torch.save(dataset, save_path)
        size_mb = os.path.getsize(save_path) / (1024 * 1024)
        print(f"\nSaved to {save_path} ({size_mb:.1f} MB)")

    return dataset


class CircuitDataset(Dataset):
    def __init__(self, data_path: str = None, data_dict: Dict = None):
        if data_path:
            self.data = torch.load(data_path, weights_only=False)
        elif data_dict:
            self.data = data_dict
        else:
            raise ValueError("Provide data_path or data_dict")

        self.num_samples = len(self.data['impedances'])

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        return {
            'impedance': self.data['impedances'][idx],
            'sequence': self.data['sequences'][idx]
        }


def create_dataloaders(
    data_path: str,
    batch_size: int = BATCH_SIZE,
    val_split: float = 0.1,
    test_split: float = 0.1,
    num_workers: int = 4
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    data = torch.load(data_path, weights_only=False)
    n_total = len(data['impedances'])

    n_test = int(n_total * test_split)
    n_val = int(n_total * val_split)
    n_train = n_total - n_val - n_test

    perm = torch.randperm(n_total)
    train_idx = perm[:n_train]
    val_idx = perm[n_train:n_train + n_val]
    test_idx = perm[n_train + n_val:]

    def subset(indices):
        return {
            'impedances': data['impedances'][indices],
            'sequences': data['sequences'][indices]
        }

    train_ds = CircuitDataset(data_dict=subset(train_idx))
    val_ds = CircuitDataset(data_dict=subset(val_idx))
    test_ds = CircuitDataset(data_dict=subset(test_idx))

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    print(f"Dataset: train={n_train}, val={n_val}, test={n_test}")

    return train_loader, val_loader, test_loader


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate circuit dataset")
    parser.add_argument('--num-samples', type=int, default=100000)
    parser.add_argument('--min-components', type=int, default=3)
    parser.add_argument('--max-components', type=int, default=10)
    parser.add_argument('--max-nodes', type=int, default=8)
    parser.add_argument('--rlc-ratio', type=float, default=0.8)
    parser.add_argument('--num-workers', type=int, default=None)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--output', type=str, default='outputs/dataset.pt')

    args = parser.parse_args()

    generate_dataset(
        num_samples=args.num_samples,
        min_components=args.min_components,
        max_components=args.max_components,
        max_nodes=args.max_nodes,
        rlc_ratio=args.rlc_ratio,
        num_workers=args.num_workers,
        seed=args.seed,
        save_path=args.output
    )
