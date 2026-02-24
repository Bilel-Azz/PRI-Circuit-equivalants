#!/usr/bin/env python3
from circuit_drawer import (
    Component,
    draw_circuit_graph,
    draw_circuit_schematic,
    sequence_to_components
)
import numpy as np


def demo_basic():
    print("=== Basic Demo ===\n")
    print("1. Simple RLC Series Circuit:")
    components = [
        Component(1, 0, 1, 100),       # R = 100Ω
        Component(2, 1, 2, 0.001),     # L = 1mH
        Component(3, 2, 0, 1e-6),      # C = 1µF
    ]
    draw_circuit_schematic(components, title="Simple RLC Series",
                           save_path="demo_rlc_series.png")

    print("\n2. Parallel RC Circuit:")
    components = [
        Component(1, 0, 1, 1000),      # R = 1kΩ
        Component(3, 0, 1, 100e-9),    # C = 100nF (parallel with R)
    ]
    draw_circuit_graph(components, title="Parallel RC",
                       save_path="demo_rc_parallel.png")

    print("\n3. Complex RLC Network:")
    components = [
        Component(1, 0, 1, 470),       # R1 = 470Ω
        Component(1, 1, 2, 1000),      # R2 = 1kΩ
        Component(2, 2, 3, 0.01),      # L = 10mH
        Component(3, 3, 0, 10e-9),     # C1 = 10nF
        Component(3, 1, 0, 100e-9),    # C2 = 100nF (branch)
        Component(1, 2, 0, 10000),     # R3 = 10kΩ (branch)
    ]
    draw_circuit_graph(components, title="Complex RLC Network",
                       save_path="demo_complex.png")


def demo_from_sequence():
    print("\n=== Sequence Conversion Demo ===\n")

    # Format: [type, node_a, node_b, normalized_value]
    # Types: 0=PAD, 1=R, 2=L, 3=C, 4=START, 5=END
    sequence = np.array([
        [4, 0, 0, 0.0],     # START
        [1, 0, 1, 0.0],     # R ≈ 1kΩ (normalized around log10(1000)-3=0)
        [2, 1, 2, 0.0],     # L ≈ 100µH (normalized around log10(1e-4)-(-4)=0)
        [3, 2, 0, 0.0],     # C ≈ 10nF (normalized around log10(1e-8)-(-8)=0)
        [5, 0, 0, 0.0],     # END
        [0, 0, 0, 0.0],     # PAD
    ])

    components = sequence_to_components(sequence)

    print("Sequence (model output format):")
    print(sequence)
    print(f"\nConverted to {len(components)} components:")
    for c in components:
        print(f"  {c.label} (nodes {c.node_a}-{c.node_b})")

    draw_circuit_schematic(components, title="Circuit from Model Sequence",
                           save_path="demo_from_sequence.png")


def demo_various_values():
    print("\n=== Various Component Values Demo ===\n")

    components = [
        Component(1, 0, 1, 10),        # 10Ω
        Component(1, 1, 2, 4700),      # 4.7kΩ
        Component(1, 2, 3, 1e6),       # 1MΩ
        Component(2, 3, 4, 100e-9),    # 100nH
        Component(2, 4, 5, 10e-3),     # 10mH
        Component(3, 5, 0, 1e-12),     # 1pF
        Component(3, 0, 1, 100e-6),    # 100µF
    ]

    print("Components with various values:")
    for c in components:
        print(f"  {c.label}")

    draw_circuit_schematic(components, title="Various Component Values",
                           save_path="demo_values.png")


if __name__ == "__main__":
    demo_basic()
    demo_from_sequence()
    demo_various_values()

    print("\n" + "="*60)
    print("Demo complete! Check the generated PNG files.")
    print("="*60)
