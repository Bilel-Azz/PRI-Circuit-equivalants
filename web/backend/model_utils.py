"""
Model loading and inference utilities.

This module handles model loading and circuit generation.
Modify config.py to change model paths and parameters.
"""
import sys
from pathlib import Path
import numpy as np
import torch
from scipy.signal import find_peaks

# Load backend config explicitly (avoids name collision with circuit_transformer/config.py)
import importlib.util
_spec = importlib.util.spec_from_file_location(
    "backend_config", Path(__file__).parent / "backend_config.py"
)
local_config = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(local_config)

# Now add circuit_transformer to path for model imports
_ct_path = str(Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer"))
if _ct_path not in sys.path:
    sys.path.insert(0, _ct_path)

PEAK_PROMINENCE = 0.3
PEAK_MISMATCH_PENALTY = 0.5
DERIVATIVE_WEIGHT = 0.3


def count_resonances(magnitude):
    """Count peaks and valleys in magnitude curve."""
    mag = np.array(magnitude)
    peaks, _ = find_peaks(mag, prominence=PEAK_PROMINENCE)
    valleys, _ = find_peaks(-mag, prominence=PEAK_PROMINENCE)
    return len(peaks), len(valleys)


def compute_shape_score(target_mag, candidate_mag, rmse):
    """Score = RMSE + derivative error + peak mismatch penalty."""
    target_mag = np.array(target_mag)
    candidate_mag = np.array(candidate_mag)

    # Derivative matching (captures slope changes = resonances)
    d1_target = np.diff(target_mag)
    d1_candidate = np.diff(candidate_mag)
    deriv_err = np.mean(np.abs(d1_target - d1_candidate))

    # Peak/valley count mismatch
    t_peaks, t_valleys = count_resonances(target_mag)
    c_peaks, c_valleys = count_resonances(candidate_mag)
    peak_penalty = (abs(t_peaks - c_peaks) + abs(t_valleys - c_valleys)) * PEAK_MISMATCH_PENALTY

    return rmse + DERIVATIVE_WEIGHT * deriv_err + peak_penalty


from models.model_v2 import CircuitTransformerV2
from models.model_v10 import CircuitTransformerV10
from models.model_v11 import CircuitTransformerV11
from models.encoder_v10 import compute_derivative_features
from data.solver import compute_impedance as _solver_compute
from data.circuit import Circuit, Component

MODEL_CHECKPOINT = local_config.MODEL_CHECKPOINT
MODEL_CONFIG = local_config.MODEL_CONFIG
NUM_FREQ = local_config.NUM_FREQ
FREQ_MIN = local_config.FREQ_MIN
FREQ_MAX = local_config.FREQ_MAX
VALUE_CENTER = local_config.VALUE_CENTER
DEFAULT_TAU = local_config.DEFAULT_TAU
DEFAULT_NUM_CANDIDATES = local_config.DEFAULT_NUM_CANDIDATES


class CircuitModel:
    """Wrapper for circuit transformer model."""

    def __init__(self, checkpoint_path: str = None, device: str = None):
        """
        Initialize model.

        Args:
            checkpoint_path: Path to model checkpoint (uses config default if None)
            device: Device to use ('cuda', 'cpu', or None for auto)
        """
        self.checkpoint_path = checkpoint_path or str(MODEL_CHECKPOINT)

        if device is None:
            if torch.cuda.is_available():
                self.device = torch.device('cuda')
            elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                self.device = torch.device('mps')
            else:
                self.device = torch.device('cpu')
        else:
            self.device = torch.device(device)

        self.model = None
        self.freqs = np.logspace(np.log10(FREQ_MIN), np.log10(FREQ_MAX), NUM_FREQ)

    def load(self):
        """Load model from checkpoint. Auto-detects V2/V10/V11."""
        print(f"Loading model from {self.checkpoint_path}")
        print(f"Device: {self.device}")

        # Load checkpoint to detect version
        checkpoint = torch.load(self.checkpoint_path, map_location=self.device, weights_only=False)
        version = checkpoint.get('model_version', 'V2')
        print(f"Model version: {version}")

        # Create correct model class
        kwargs = dict(
            latent_dim=MODEL_CONFIG["latent_dim"],
            d_model=MODEL_CONFIG["d_model"],
            nhead=MODEL_CONFIG["nhead"],
            num_layers=MODEL_CONFIG["num_layers"],
        )
        if version == 'V11':
            self.model = CircuitTransformerV11(**kwargs).to(self.device)
            self._uses_6ch = True
        elif version == 'V10':
            self.model = CircuitTransformerV10(**kwargs).to(self.device)
            self._uses_6ch = True
        else:
            self.model = CircuitTransformerV2(**kwargs).to(self.device)
            self._uses_6ch = False

        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()

        epoch = checkpoint.get('epoch', 'unknown')
        print(f"Model {version} loaded (epoch {epoch})")

    def sequence_to_components(self, seq: np.ndarray) -> list:
        """Convert model output sequence to component list."""
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

            type_names = {1: 'R', 2: 'L', 3: 'C'}
            components.append({
                'type': type_names[comp_type],
                'type_id': comp_type,
                'node_a': node_a,
                'node_b': node_b,
                'value': float(value),
                'normalized_value': float(normalized_value),
            })

        return components

    def compute_impedance_for_components(self, components: list) -> dict:
        """Compute Z(f) for a list of components using MNA solver."""
        if not components:
            return None

        comps = [
            Component(c['type_id'], c['node_a'], c['node_b'], c['value'])
            for c in components
        ]
        max_node = max(max(c['node_a'], c['node_b']) for c in components)
        circuit = Circuit(comps, num_nodes=max_node + 1)

        z = _solver_compute(circuit)  # Returns (2, NUM_FREQ): [log_mag, phase]

        if z is None:
            return None

        z = np.asarray(z)
        if z.ndim == 2 and z.shape[0] == 2:
            magnitude = z[0].tolist()
            phase = z[1].tolist()
        else:
            magnitude = np.log10(np.abs(z) + 1e-10).tolist()
            phase = np.angle(z).tolist()

        return {
            'magnitude': magnitude,
            'phase': phase,
            'frequencies': self.freqs.tolist(),
        }

    def generate(self, impedance: np.ndarray, tau: float = None,
                 num_candidates: int = None) -> dict:
        """
        Generate circuit from impedance curve using Best-of-N.

        Args:
            impedance: Array of shape (2, NUM_FREQ) with [log_magnitude, phase]
            tau: Temperature for generation
            num_candidates: Number of candidates for Best-of-N

        Returns:
            Dictionary with best circuit and all candidates
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load() first.")

        tau = tau or DEFAULT_TAU
        num_candidates = num_candidates or DEFAULT_NUM_CANDIDATES

        # Convert to tensor
        z_tensor = torch.tensor(impedance, dtype=torch.float32).to(self.device)
        if z_tensor.dim() == 2:
            z_tensor = z_tensor.unsqueeze(0)

        # Expand 2-channel to 6-channel if model uses derivatives (V10/V11)
        if getattr(self, '_uses_6ch', False):
            z_tensor = compute_derivative_features(z_tensor)

        # Generate N candidates
        candidates = []

        with torch.no_grad():
            for i in range(num_candidates):
                seq = self.model.generate(z_tensor, tau=tau)
                seq_np = seq[0].cpu().numpy()
                components = self.sequence_to_components(seq_np)

                if components:
                    # Compute impedance for this candidate
                    z_pred = self.compute_impedance_for_components(components)

                    if z_pred:
                        # Compute error
                        mag_error = np.mean(np.abs(
                            np.array(z_pred['magnitude']) - impedance[0]
                        ))
                        phase_error = np.mean(np.abs(
                            np.array(z_pred['phase']) - impedance[1]
                        ))
                        total_error = mag_error + 0.1 * phase_error

                        # Shape-aware scoring (penalizes missing peaks/wrong slopes)
                        shape_score = compute_shape_score(
                            impedance[0], z_pred['magnitude'], total_error
                        )

                        candidates.append({
                            'components': components,
                            'impedance': z_pred,
                            'error': {
                                'magnitude': float(mag_error),
                                'phase': float(phase_error),
                                'total': float(total_error),
                                'shape_score': float(shape_score),
                            }
                        })

        if not candidates:
            return {
                'success': False,
                'message': 'No valid circuits generated',
                'best': None,
                'candidates': [],
            }

        # Sort by shape score (considers peaks + derivatives, not just RMSE)
        candidates.sort(key=lambda x: x['error']['shape_score'])

        return {
            'success': True,
            'best': candidates[0],
            'candidates': candidates,
            'num_candidates': len(candidates),
        }

    def format_component_value(self, comp: dict) -> str:
        """Format component value with appropriate unit."""
        value = comp['value']
        comp_type = comp['type']

        if comp_type == 'R':
            if value >= 1e6:
                return f"{value/1e6:.2f}MΩ"
            elif value >= 1e3:
                return f"{value/1e3:.2f}kΩ"
            else:
                return f"{value:.2f}Ω"
        elif comp_type == 'L':
            if value >= 1:
                return f"{value:.2f}H"
            elif value >= 1e-3:
                return f"{value*1e3:.2f}mH"
            elif value >= 1e-6:
                return f"{value*1e6:.2f}µH"
            else:
                return f"{value*1e9:.2f}nH"
        elif comp_type == 'C':
            if value >= 1e-6:
                return f"{value*1e6:.2f}µF"
            elif value >= 1e-9:
                return f"{value*1e9:.2f}nF"
            else:
                return f"{value*1e12:.2f}pF"
        return str(value)


# Global model instance
_model = None


def get_model() -> CircuitModel:
    """Get or create global model instance."""
    global _model
    if _model is None:
        _model = CircuitModel()
        _model.load()
    return _model
