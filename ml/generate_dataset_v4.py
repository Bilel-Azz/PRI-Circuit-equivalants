"""Generate dataset V4 with more pronounced double resonances."""
import argparse
import numpy as np
import torch
from tqdm import tqdm
from concurrent.futures import ProcessPoolExecutor
import sys

sys.path.insert(0, ".")

from data.generator_v4 import generate_circuit_v4
from data.solver import compute_impedance
from data.circuit import circuit_to_sequence
from config import FREQUENCIES, NUM_FREQ


def generate_sample(_):
    """Generate one sample."""
    for _ in range(10):  # Max retries
        try:
            circuit = generate_circuit_v4()
            z = compute_impedance(circuit)
            
            if z is None or len(z) != NUM_FREQ:
                continue
                
            mag = np.log10(np.abs(z) + 1e-10).flatten()
            phase = np.angle(z).flatten()
            
            # Skip if invalid
            if np.any(np.isnan(mag)) or np.any(np.isinf(mag)):
                continue
            if np.any(np.isnan(phase)) or np.any(np.isinf(phase)):
                continue
                
            impedance = np.stack([mag, phase], axis=0)
            sequence = circuit_to_sequence(circuit)
            
            return impedance, sequence
        except Exception as e:
            continue
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--num-samples", type=int, default=150000)
    parser.add_argument("--output", type=str, default="outputs/dataset_v4.pt")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    print(f"Generating {args.num_samples} samples with {args.workers} workers...")
    
    impedances = []
    sequences = []
    
    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        results = list(tqdm(
            executor.map(generate_sample, range(args.num_samples)),
            total=args.num_samples
        ))
    
    for r in results:
        if r is not None:
            impedances.append(r[0])
            sequences.append(r[1])
    
    print(f"Valid samples: {len(impedances)}/{args.num_samples}")
    
    # Stack and save
    impedances = torch.tensor(np.stack(impedances), dtype=torch.float32)
    sequences = torch.tensor(np.stack(sequences), dtype=torch.float32)
    
    torch.save({
        "impedances": impedances,
        "sequences": sequences
    }, args.output)
    
    print(f"Saved to {args.output}")
    print(f"Impedances shape: {impedances.shape}")
    print(f"Sequences shape: {sequences.shape}")


if __name__ == "__main__":
    main()
