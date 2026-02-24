"""Impedance Encoder: Z(f) -> latent vector using 1D CNN."""
import torch
import torch.nn as nn
import torch.nn.functional as F

from config import NUM_FREQ, LATENT_DIM


class ImpedanceEncoder(nn.Module):
    """
    Input: (batch, 2, NUM_FREQ) - [log|Z|, phase]
    Output: (batch, latent_dim)
    """

    def __init__(
        self,
        num_freq: int = NUM_FREQ,
        latent_dim: int = LATENT_DIM,
        hidden_dim: int = 512
    ):
        super().__init__()

        self.conv1 = nn.Conv1d(2, 64, kernel_size=5, padding=2)
        self.conv2 = nn.Conv1d(64, 128, kernel_size=5, padding=2)
        self.conv3 = nn.Conv1d(128, 256, kernel_size=3, padding=1)

        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(128)
        self.bn3 = nn.BatchNorm1d(256)

        self.pool = nn.MaxPool1d(2)

        # Size after 3 pooling: num_freq // 8
        conv_out_size = 256 * (num_freq // 8)

        self.fc1 = nn.Linear(conv_out_size, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, latent_dim)

        self.dropout = nn.Dropout(0.1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        x = self.pool(F.relu(self.bn3(self.conv3(x))))

        x = x.view(x.size(0), -1)

        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)

        return x
