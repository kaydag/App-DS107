import torch
from PIL import Image
from torchvision import transforms

CLASS_NAMES = ["fake","real"]

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229,0.224,0.225]
    )
])


def predict_image(image_path, model):
    image = Image.open(image_path).convert("RGB")
    tensor = transform(image)
    tensor = tensor.unsqueeze(0)
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits,dim=1)[0]
    pred_idx = torch.argmax(probs).item()
    prediction = CLASS_NAMES[pred_idx]
    return {
        "prediction": prediction,
        "confidence": float(probs[pred_idx]),
        "real_probability": float(probs[0]),
        "ai_probability": float(probs[1])
    }