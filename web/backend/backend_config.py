"""
Configuration for Circuit Web API.

MODIFY THIS FILE TO CHANGE MODEL OR PARAMETERS.
"""
from pathlib import Path

# =============================================================================
# MODEL CONFIGURATION - MODIFY HERE TO CHANGE MODEL
# =============================================================================

# Available checkpoints (change MODEL_CHECKPOINT to switch)
CHECKPOINT_V9C = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v9c_best.pt")
CHECKPOINT_V10 = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v10_best_reward.pt")
CHECKPOINT_V11 = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v11_best_reward.pt")
CHECKPOINT_V12 = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v12_best.pt")

# Active model checkpoint
CHECKPOINT_V5 = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v5/checkpoints/best.pt")
CHECKPOINT_V5_VERIFIED = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v5_verified_best.pt")
CHECKPOINT_V10_VERIFIED = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v10_verified_best.pt")
CHECKPOINT_V5_BALANCED = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v5_balanced_best.pt")

# Active model checkpoint
MODEL_CHECKPOINT = CHECKPOINT_V5

# Model architecture parameters (must match trained model)
MODEL_CONFIG = {
    "latent_dim": 256,
    "d_model": 512,
    "nhead": 8,
    "num_layers": 6,
}

# =============================================================================
# IMPEDANCE PARAMETERS
# =============================================================================

NUM_FREQ = 100
FREQ_MIN = 10.0
FREQ_MAX = 1e7

# =============================================================================
# GENERATION PARAMETERS
# =============================================================================

# Temperature for generation (lower = more deterministic)
DEFAULT_TAU = 0.5

# Number of candidates for Best-of-N
DEFAULT_NUM_CANDIDATES = 10

# =============================================================================
# VALUE NORMALIZATION (must match training)
# =============================================================================

VALUE_CENTER = {
    1: 3.0,   # R: center at 1kOhm (10^3)
    2: -4.0,  # L: center at 100uH (10^-4)
    3: -8.0,  # C: center at 10nF (10^-8)
}

# =============================================================================
# API SETTINGS
# =============================================================================

API_HOST = "0.0.0.0"
API_PORT = 8000
CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
