import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
import networkx as nx
from typing import List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class Component:
    comp_type: int  # 1=R, 2=L, 3=C
    node_a: int
    node_b: int
    value: float

    @property
    def type_name(self) -> str:
        return {1: 'R', 2: 'L', 3: 'C'}.get(self.comp_type, '?')

    @property
    def value_str(self) -> str:
        v = self.value
        if v >= 1e6:
            return f"{v/1e6:.1f}M"
        elif v >= 1e3:
            return f"{v/1e3:.1f}k"
        elif v >= 1:
            return f"{v:.1f}"
        elif v >= 1e-3:
            return f"{v*1e3:.1f}m"
        elif v >= 1e-6:
            return f"{v*1e6:.1f}µ"
        elif v >= 1e-9:
            return f"{v*1e9:.1f}n"
        elif v >= 1e-12:
            return f"{v*1e12:.1f}p"
        else:
            return f"{v:.2e}"

    @property
    def label(self) -> str:
        units = {1: 'Ω', 2: 'H', 3: 'F'}
        return f"{self.type_name}={self.value_str}{units.get(self.comp_type, '')}"


def sequence_to_components(sequence: np.ndarray) -> List[Component]:
    if sequence.ndim == 1:
        sequence = sequence.reshape(-1, 4)

    components = []

    # log10 centers for denormalization: R~1kΩ, L~100µH, C~10nF
    VALUE_CENTER = {1: 3.0, 2: -4.0, 3: -8.0}

    for row in sequence:
        comp_type = int(row[0])
        if comp_type not in [1, 2, 3]:
            continue

        node_a = int(row[1])
        node_b = int(row[2])
        normalized_value = row[3]
        log_value = normalized_value + VALUE_CENTER.get(comp_type, 0)
        value = 10 ** log_value

        components.append(Component(comp_type, node_a, node_b, value))

    return components


def draw_resistor(ax, x, y, width=0.4, height=0.15, horizontal=True):
    if horizontal:
        n_zigs = 4
        zig_width = width / (n_zigs * 2)
        points = [(x - width/2, y)]
        for i in range(n_zigs):
            points.append((x - width/2 + zig_width * (2*i + 1), y + height/2))
            points.append((x - width/2 + zig_width * (2*i + 2), y - height/2))
        points.append((x + width/2, y))

        xs, ys = zip(*points)
        ax.plot(xs, ys, 'k-', linewidth=1.5)
    else:
        n_zigs = 4
        zig_height = height / (n_zigs * 2)
        points = [(x, y - height/2)]
        for i in range(n_zigs):
            points.append((x + width/2, y - height/2 + zig_height * (2*i + 1)))
            points.append((x - width/2, y - height/2 + zig_height * (2*i + 2)))
        points.append((x, y + height/2))

        xs, ys = zip(*points)
        ax.plot(xs, ys, 'k-', linewidth=1.5)


def draw_capacitor(ax, x, y, width=0.2, height=0.3, horizontal=True):
    if horizontal:
        gap = width / 3
        ax.plot([x - gap/2, x - gap/2], [y - height/2, y + height/2], 'k-', linewidth=2)
        ax.plot([x + gap/2, x + gap/2], [y - height/2, y + height/2], 'k-', linewidth=2)
        ax.plot([x - width/2, x - gap/2], [y, y], 'k-', linewidth=1.5)
        ax.plot([x + gap/2, x + width/2], [y, y], 'k-', linewidth=1.5)
    else:
        gap = height / 3
        ax.plot([x - width/2, x + width/2], [y - gap/2, y - gap/2], 'k-', linewidth=2)
        ax.plot([x - width/2, x + width/2], [y + gap/2, y + gap/2], 'k-', linewidth=2)
        ax.plot([x, x], [y - height/2, y - gap/2], 'k-', linewidth=1.5)
        ax.plot([x, x], [y + gap/2, y + height/2], 'k-', linewidth=1.5)


def draw_inductor(ax, x, y, width=0.4, height=0.15, horizontal=True):
    if horizontal:
        n_loops = 3
        loop_width = width / n_loops

        ax.plot([x - width/2, x - width/2 + loop_width/4], [y, y], 'k-', linewidth=1.5)

        for i in range(n_loops):
            cx = x - width/2 + loop_width/4 + i * loop_width + loop_width/2
            theta = np.linspace(0, np.pi, 20)
            xs = cx + (loop_width/2) * np.cos(theta)
            ys = y + height * np.sin(theta)
            ax.plot(xs, ys, 'k-', linewidth=1.5)

        ax.plot([x + width/2 - loop_width/4, x + width/2], [y, y], 'k-', linewidth=1.5)
    else:
        n_loops = 3
        loop_height = height / n_loops

        for i in range(n_loops):
            cy = y - height/2 + loop_height/2 + i * loop_height
            theta = np.linspace(-np.pi/2, np.pi/2, 20)
            xs = x + width * np.cos(theta)
            ys = cy + (loop_height/2) * np.sin(theta)
            ax.plot(xs, ys, 'k-', linewidth=1.5)


def draw_component(ax, comp_type: int, x: float, y: float,
                   horizontal: bool = True, label: str = ""):
    if comp_type == 1:  # R
        draw_resistor(ax, x, y, horizontal=horizontal)
    elif comp_type == 2:  # L
        draw_inductor(ax, x, y, horizontal=horizontal)
    elif comp_type == 3:  # C
        draw_capacitor(ax, x, y, horizontal=horizontal)

    if label:
        offset = 0.25 if horizontal else 0.3
        ax.text(x, y + offset, label, ha='center', va='bottom', fontsize=8)


def draw_circuit_graph(components: List[Component],
                       title: str = "Circuit",
                       figsize: Tuple[int, int] = (12, 8),
                       save_path: Optional[str] = None):
    if not components:
        return

    G = nx.MultiGraph()
    nodes = set()
    for c in components:
        nodes.add(c.node_a)
        nodes.add(c.node_b)
    for n in nodes:
        G.add_node(n)
    for i, c in enumerate(components):
        G.add_edge(c.node_a, c.node_b, comp=c, idx=i)

    fig, ax = plt.subplots(figsize=figsize)

    if len(nodes) <= 2:
        pos = {n: (i * 2, 0) for i, n in enumerate(sorted(nodes))}
    else:
        pos = nx.spring_layout(G, k=2, iterations=50, seed=42)
        xs = [p[0] for p in pos.values()]
        ys = [p[1] for p in pos.values()]
        x_range = max(xs) - min(xs) if max(xs) != min(xs) else 1
        y_range = max(ys) - min(ys) if max(ys) != min(ys) else 1
        for n in pos:
            pos[n] = ((pos[n][0] - min(xs)) / x_range * 8,
                      (pos[n][1] - min(ys)) / y_range * 6)

    for node, (x, y) in pos.items():
        circle = Circle((x, y), 0.15, fill=True, color='lightblue',
                        edgecolor='black', linewidth=1.5, zorder=10)
        ax.add_patch(circle)
        label = "GND" if node == 0 else f"N{node}"
        ax.text(x, y, label, ha='center', va='center', fontsize=9,
                fontweight='bold', zorder=11)

    edge_counts = {}
    for c in components:
        key = (min(c.node_a, c.node_b), max(c.node_a, c.node_b))
        edge_counts[key] = edge_counts.get(key, 0) + 1
        offset_idx = edge_counts[key] - 1

        x1, y1 = pos[c.node_a]
        x2, y2 = pos[c.node_b]

        mx, my = (x1 + x2) / 2, (y1 + y2) / 2

        # Perpendicular offset for parallel components
        if offset_idx > 0:
            dx, dy = x2 - x1, y2 - y1
            length = np.sqrt(dx*dx + dy*dy)
            if length > 0:
                px, py = -dy/length, dx/length
                mx += px * 0.5 * offset_idx
                my += py * 0.5 * offset_idx

        horizontal = abs(x2 - x1) > abs(y2 - y1)
        if horizontal:
            ax.plot([x1, mx - 0.25], [y1, my], 'k-', linewidth=1.5)
            ax.plot([mx + 0.25, x2], [my, y2], 'k-', linewidth=1.5)
        else:
            ax.plot([x1, mx], [y1, my - 0.2], 'k-', linewidth=1.5)
            ax.plot([mx, x2], [my + 0.2, y2], 'k-', linewidth=1.5)

        draw_component(ax, c.comp_type, mx, my, horizontal=horizontal, label=c.label)

    ax.set_xlim(-1, 10)
    ax.set_ylim(-1, 8)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title(title, fontsize=14, fontweight='bold')

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches='tight',
                    facecolor='white', edgecolor='none')

    plt.show()
    return fig


def draw_circuit_schematic(components: List[Component],
                           title: str = "Circuit Schematic",
                           figsize: Tuple[int, int] = (14, 6),
                           save_path: Optional[str] = None):
    if not components:
        return

    fig, ax = plt.subplots(figsize=figsize)

    spacing = 2.0
    y_base = 3
    x_start = 1

    ax.plot([0, x_start], [y_base, y_base], 'k-', linewidth=2)
    ax.text(0, y_base + 0.3, 'IN', ha='center', fontsize=10, fontweight='bold')

    current_x = x_start

    for i, comp in enumerate(components):
        draw_component(ax, comp.comp_type, current_x + spacing/2, y_base,
                       horizontal=True, label=comp.label)
        ax.plot([current_x, current_x + 0.3], [y_base, y_base], 'k-', linewidth=1.5)
        ax.plot([current_x + spacing - 0.3, current_x + spacing], [y_base, y_base], 'k-', linewidth=1.5)
        node_label = f"({comp.node_a}-{comp.node_b})"
        ax.text(current_x + spacing/2, y_base - 0.4, node_label,
                ha='center', va='top', fontsize=7, color='gray')

        current_x += spacing

    ax.plot([current_x, current_x + 1], [y_base, y_base], 'k-', linewidth=2)
    ax.text(current_x + 1, y_base + 0.3, 'GND', ha='center', fontsize=10, fontweight='bold')

    gnd_x = current_x + 1
    ax.plot([gnd_x, gnd_x], [y_base, y_base - 0.3], 'k-', linewidth=2)
    for i, w in enumerate([0.3, 0.2, 0.1]):
        ax.plot([gnd_x - w, gnd_x + w],
                [y_base - 0.3 - i*0.1, y_base - 0.3 - i*0.1], 'k-', linewidth=2)

    ax.set_xlim(-0.5, current_x + 2)
    ax.set_ylim(0, 6)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)

    type_counts = {}
    for c in components:
        type_counts[c.type_name] = type_counts.get(c.type_name, 0) + 1
    count_str = ", ".join([f"{k}:{v}" for k, v in sorted(type_counts.items())])
    ax.text(0.5, 0.02, f"Components: {count_str}", transform=ax.transAxes,
            fontsize=10, ha='left', va='bottom')

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches='tight',
                    facecolor='white', edgecolor='none')

    plt.show()
    return fig
