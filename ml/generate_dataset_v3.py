"""Generate dataset V3 with balanced distribution."""
import argparse
import torch
import numpy as np
from tqdm import tqdm
from multiprocessing import Pool, cpu_count
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from data.generator_v3 import generate_circuit_v3
from data.solver import compute_impedance
from data.circuit import circuit_to_sequence


def generate_sample(seed):
    np.random.seed(seed)
    
    for _ in range(10):
        circuit = generate_circuit_v3()
        if circuit and len(circuit.components) > 0:
            try:
                Z = compute_impedance(circuit)
                seq = circuit_to_sequence(circuit)
                return Z, seq
            except:
                continue
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--num-samples', type=int, default=150000)
    parser.add_argument('--output', type=str, default='outputs/dataset_v3.pt')
    parser.add_argument('--workers', type=int, default=None)
    parser.add_argument('--seed', type=int, default=42)
    args = parser.parse_args()
    
    np.random.seed(args.seed)
    seeds = np.random.randint(0, 2**31, size=args.num_samples)
    
    workers = args.workers or max(1, cpu_count() - 1)
    print(f"Generating {args.num_samples} samples with {workers} workers...")
    
    impedances = []
    sequences = []
    
    with Pool(workers) as pool:
        results = list(tqdm(pool.imap(generate_sample, seeds), total=args.num_samples))
    
    for r in results:
        if r is not None:
            Z, seq = r
            impedances.append(Z)
            sequences.append(seq)
    
    print(f"\nValid samples: {len(impedances)}/{args.num_samples} ({100*len(impedances)/args.num_samples:.1f}%)")
    
    impedances = torch.tensor(np.array(impedances), dtype=torch.float32)
    sequences = torch.tensor(np.array(sequences), dtype=torch.float32)
    
    torch.save({
        'impedances': impedances,
        'sequences': sequences
    }, args.output)
    
    print(f"Saved to {args.output}")
    print(f"  Impedances: {impedances.shape}")
    print(f"  Sequences: {sequences.shape}")


if __name__ == '__main__':
    main()
