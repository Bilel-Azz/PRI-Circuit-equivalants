import numpy as np
from dataclasses import dataclass
from typing import List, Dict

from config import (
    COMP_R, COMP_L, COMP_C,
    LOG_R_MIN, LOG_R_MAX, LOG_L_MIN, LOG_L_MAX, LOG_C_MIN, LOG_C_MAX,
    MAX_NODES, MAX_COMPONENTS, VALUE_CENTER
)


@dataclass
class Component:
    comp_type: int   # 1=R, 2=L, 3=C
    node_a: int
    node_b: int
    value: float     # SI units

    def __repr__(self):
        names = {COMP_R: 'R', COMP_L: 'L', COMP_C: 'C'}
        return f"{names[self.comp_type]}({self.value:.2e}) [{self.node_a}-{self.node_b}]"


@dataclass
class Circuit:
    components: List[Component]
    num_nodes: int

    def __repr__(self):
        lines = [f"Circuit({len(self.components)} components, {self.num_nodes} nodes):"]
        for c in self.components:
            lines.append(f"  {c}")
        return "\n".join(lines)


def random_value(comp_type: int) -> float:
    if comp_type == COMP_R:
        log_val = np.random.uniform(LOG_R_MIN, LOG_R_MAX)
    elif comp_type == COMP_L:
        log_val = np.random.uniform(LOG_L_MIN, LOG_L_MAX)
    elif comp_type == COMP_C:
        log_val = np.random.uniform(LOG_C_MIN, LOG_C_MAX)
    else:
        return 0.0
    return 10 ** log_val


def get_node_degrees(components: List[Component]) -> Dict[int, int]:
    degrees = {}
    for c in components:
        degrees[c.node_a] = degrees.get(c.node_a, 0) + 1
        degrees[c.node_b] = degrees.get(c.node_b, 0) + 1
    return degrees


def is_valid_circuit(components: List[Component]) -> bool:
    """
    Strict validation:
    - All nodes connected
    - No dead-end nodes (except IN=1 and GND=0)
    - No duplicate connections
    """
    if not components:
        return False

    type_edges = set()
    adj = {}
    nodes = set()

    for c in components:
        na, nb = c.node_a, c.node_b
        if na == nb:
            return False
        type_edge = (c.comp_type, min(na, nb), max(na, nb))
        if type_edge in type_edges:
            return False
        type_edges.add(type_edge)
        nodes.add(na)
        nodes.add(nb)
        adj.setdefault(na, set()).add(nb)
        adj.setdefault(nb, set()).add(na)

    if 0 not in nodes or 1 not in nodes:
        return False

    for node in nodes:
        if node not in [0, 1] and len(adj.get(node, set())) < 2:
            return False

    # BFS connectivity from IN
    visited = {1}
    queue = [1]
    while queue:
        curr = queue.pop(0)
        for neighbor in adj.get(curr, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return visited == nodes


def generate_random_circuit(
    min_components: int = 3,
    max_components: int = MAX_COMPONENTS,
    max_nodes: int = MAX_NODES,
    force_rlc: bool = True
) -> Circuit:
    """Generate a random valid circuit with retry logic."""
    for attempt in range(50):
        circuit = _try_generate_circuit(min_components, max_components, max_nodes, force_rlc)
        if circuit and is_valid_circuit(circuit.components):
            return circuit

    return _generate_simple_circuit(min_components, force_rlc)


def _try_generate_circuit(
    min_components: int,
    max_components: int,
    max_nodes: int,
    force_rlc: bool
) -> Circuit:
    num_components = np.random.randint(min_components, max_components + 1)

    if force_rlc and num_components >= 3:
        types = [COMP_R, COMP_L, COMP_C]
        for _ in range(num_components - 3):
            types.append(np.random.choice([COMP_R, COMP_L, COMP_C]))
        np.random.shuffle(types)
    else:
        types = [np.random.choice([COMP_R, COMP_L, COMP_C]) for _ in range(num_components)]

    existing_type_edges = set()
    components = []
    comp_idx = 0

    # Strategy: ladder/mesh structure
    # 1. Main path: IN -> n2 -> n3 -> ... -> GND
    # 2. Cross-connections between path nodes
    # 3. Shunt branches (node -> GND)
    path_internal = min(max(2, num_components // 3), max_nodes - 2)
    path_nodes = [1] + list(range(2, 2 + path_internal)) + [0]
    num_nodes = 2 + path_internal

    for i in range(len(path_nodes) - 1):
        if comp_idx >= num_components:
            break
        na, nb = path_nodes[i], path_nodes[i + 1]
        type_edge = (c.comp_type, min(na, nb), max(na, nb))
        if edge not in existing_edges:
            existing_type_edges.add(type_edge)
            components.append(Component(types[comp_idx], na, nb, random_value(types[comp_idx])))
            comp_idx += 1

    internal_nodes = [n for n in path_nodes if n not in [0, 1]]

    while comp_idx < num_components:
        strategy = np.random.choice(['cross', 'shunt', 'parallel'], p=[0.5, 0.3, 0.2])

        if strategy == 'cross' and len(internal_nodes) >= 2:
            n1, n2 = np.random.choice(internal_nodes, size=2, replace=False)
            if abs(path_nodes.index(n1) - path_nodes.index(n2)) > 1:
                edge = (min(n1, n2), max(n1, n2))
                if edge not in existing_edges:
                    existing_type_edges.add(type_edge)
                    components.append(Component(types[comp_idx], n1, n2, random_value(types[comp_idx])))
                    comp_idx += 1
                    continue

        if strategy == 'shunt' and internal_nodes:
            node = np.random.choice(internal_nodes)
            edge = (0, node)
            if edge not in existing_edges:
                existing_type_edges.add(type_edge)
                components.append(Component(types[comp_idx], node, 0, random_value(types[comp_idx])))
                comp_idx += 1
                continue

        if strategy == 'parallel':
            if len(path_nodes) > 2:
                i = np.random.randint(0, len(path_nodes) - 1)
                na, nb = path_nodes[i], path_nodes[i + 1]
                pass

        all_nodes = list(range(num_nodes))
        np.random.shuffle(all_nodes)
        added = False
        for na in all_nodes:
            for nb in all_nodes:
                if na >= nb:
                    continue
                if na == 1 and nb == 0:
                    continue
                edge = (na, nb)
                if edge not in existing_edges:
                    existing_type_edges.add(type_edge)
                    components.append(Component(types[comp_idx], na, nb, random_value(types[comp_idx])))
                    comp_idx += 1
                    added = True
                    break
            if added:
                break

        if not added:
            break

    return Circuit(components=components, num_nodes=num_nodes)


def _generate_simple_circuit(min_components: int, force_rlc: bool) -> Circuit:
    """Fallback: simple but guaranteed valid circuit."""
    components = []

    if force_rlc:
        # IN -R- n2 -L- n3 -C- GND, plus cross-connections for validity
        components = [
            Component(COMP_R, 1, 2, random_value(COMP_R)),
            Component(COMP_L, 2, 3, random_value(COMP_L)),
            Component(COMP_C, 3, 0, random_value(COMP_C)),
            Component(COMP_R, 2, 0, random_value(COMP_R)),
            Component(COMP_L, 1, 3, random_value(COMP_L)),
        ]
        num_nodes = 4
    else:
        components = [
            Component(COMP_R, 1, 2, random_value(COMP_R)),
            Component(COMP_R, 2, 0, random_value(COMP_R)),
            Component(COMP_R, 1, 0, random_value(COMP_R)),
        ]
        num_nodes = 3

    while len(components) < min_components:
        t = np.random.choice([COMP_R, COMP_L, COMP_C])
        existing = np.random.choice(components)
        na, nb = existing.node_a, existing.node_b
        components.append(Component(t, na, nb, random_value(t)))

    return Circuit(components=components, num_nodes=num_nodes)


def circuit_to_sequence(circuit: Circuit, max_len: int = 12) -> np.ndarray:
    from config import TOKEN_START, TOKEN_END, TOKEN_PAD

    seq = np.zeros((max_len, 4), dtype=np.float32)
    seq[0, 0] = TOKEN_START

    sorted_comps = sorted(circuit.components,
                         key=lambda c: (c.comp_type, c.node_a, c.node_b))

    for i, comp in enumerate(sorted_comps):
        if i + 1 >= max_len - 1:
            break
        log_val = np.log10(comp.value + 1e-15)
        center = VALUE_CENTER.get(comp.comp_type, 0.0)
        norm_val = log_val - center

        seq[i + 1, 0] = comp.comp_type
        seq[i + 1, 1] = comp.node_a
        seq[i + 1, 2] = comp.node_b
        seq[i + 1, 3] = norm_val

    end_pos = min(len(sorted_comps) + 1, max_len - 1)
    seq[end_pos, 0] = TOKEN_END
    return seq


def sequence_to_circuit(seq: np.ndarray) -> Circuit:
    from config import TOKEN_START, TOKEN_END, TOKEN_PAD

    components = []
    num_nodes = 2

    for i in range(seq.shape[0]):
        token_type = int(seq[i, 0])
        if token_type in [TOKEN_PAD, TOKEN_START, TOKEN_END]:
            continue
        if token_type in [COMP_R, COMP_L, COMP_C]:
            node_a = int(seq[i, 1])
            node_b = int(seq[i, 2])
            norm_val = seq[i, 3]
            center = VALUE_CENTER.get(token_type, 0.0)
            log_val = norm_val + center
            value = 10 ** log_val
            components.append(Component(token_type, node_a, node_b, value))
            num_nodes = max(num_nodes, node_a + 1, node_b + 1)

    return Circuit(components=components, num_nodes=num_nodes)
