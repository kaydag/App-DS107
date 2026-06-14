import os
import torch
import torch.nn as nn
from torchvision.models import densenet121

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "DenseNet121.pth"
)

def load_model():

    model = densenet121(weights=None)

    model.classifier = nn.Linear(
        model.classifier.in_features,
        2
    )

    state_dict = torch.load(
        MODEL_PATH,
        map_location="cpu"
    )

    model.load_state_dict(state_dict)

    model.eval()

    return model