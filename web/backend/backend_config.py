from pathlib import Path

# Available checkpoints
CHECKPOINT_V5 = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v5/checkpoints/best.pt")
CHECKPOINT_V5_BALANCED = Path("/Volumes/WD_BLACK2TB/PRI_TT/circuit_transformer/outputs/training_v5_balanced_best.pt")

MODEL_CHECKPOINT = CHECKPOINT_V5

# Model architecture parameters (must match trained model)
MODEL_CONFIG = {
    "latent_dim": 256,
    "d_model": 512,
    "nhead": 8,
    "num_layers": 6,
}

NUM_FREQ = 100
FREQ_MIN = 10.0
FREQ_MAX = 1e7

DEFAULT_TAU = 0.5
DEFAULT_NUM_CANDIDATES = 10

# Log10 center values for denormalization: 1=R (10^3=1kOhm), 2=L (10^-4=100uH), 3=C (10^-8=10nF)
VALUE_CENTER = {
    1: 3.0,
    2: -4.0,
    3: -8.0,
}

API_HOST = "0.0.0.0"
API_PORT = 8000
CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
