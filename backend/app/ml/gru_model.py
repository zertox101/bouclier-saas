import torch
from torch import nn


class GRUAutoencoder(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, latent_size: int):
        super().__init__()
        self.encoder = nn.GRU(input_size, hidden_size, batch_first=True)
        self.latent = nn.Linear(hidden_size, latent_size)
        self.decoder_input = nn.Linear(latent_size, hidden_size)
        self.decoder = nn.GRU(hidden_size, hidden_size, batch_first=True)
        self.output_layer = nn.Linear(hidden_size, input_size)

    def forward(self, x):
        _, h = self.encoder(x)
        h = h[-1]
        z = self.latent(h)
        dec_input = self.decoder_input(z).unsqueeze(1).repeat(1, x.size(1), 1)
        dec_out, _ = self.decoder(dec_input)
        return self.output_layer(dec_out)
