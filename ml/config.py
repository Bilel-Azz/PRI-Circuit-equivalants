import numpy as np

# Circuit parameters
MAX_COMPONENTS = 10
MAX_NODES = 8
MAX_SEQ_LEN = 12  # START + 10 components + END

COMP_R = 1
COMP_L = 2
COMP_C = 3

TOKEN_PAD = 0
TOKEN_R = 1
TOKEN_L = 2
TOKEN_C = 3
TOKEN_START = 4
TOKEN_END = 5
NUM_TOKENS = 6

# Value ranges (log10 scale)
LOG_R_MIN, LOG_R_MAX = -1, 7      # 0.1Ω to 10MΩ
LOG_L_MIN, LOG_L_MAX = -7, -1     # 100nH to 100mH
LOG_C_MIN, LOG_C_MAX = -12, -4    # 1pF to 100µF

VALUE_CENTER = {
    COMP_R: 3.0,   # 1kΩ
    COMP_L: -4.0,  # 100µH
    COMP_C: -8.0,  # 10nF
}

# Impedance parameters
FREQ_MIN = 10.0           # Hz
FREQ_MAX = 10e6           # 10 MHz
NUM_FREQ = 100

FREQUENCIES = np.logspace(np.log10(FREQ_MIN), np.log10(FREQ_MAX), NUM_FREQ)

# Model parameters
LATENT_DIM = 256
D_MODEL = 512
N_HEAD = 8
N_LAYERS = 6
DIM_FF = 2048
DROPOUT = 0.1

# Training parameters
BATCH_SIZE = 64
LEARNING_RATE = 3e-4
WEIGHT_DECAY = 1e-5
EPOCHS = 100

WEIGHT_TYPE = 1.0
WEIGHT_NODE = 0.5
WEIGHT_VALUE = 1.0

# Gumbel-Softmax temperature
TAU_START = 1.0
TAU_END = 0.3
TAU_ANNEAL_EPOCHS = 50

# Dataset parameters
DATASET_SIZE = 750000
RLC_RATIO = 0.8
MIN_COMPONENTS = 3
