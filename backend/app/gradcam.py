from PIL import Image
import numpy as np
import cv2

from torchvision import transforms

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import (
    show_cam_on_image
)

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485,0.456,0.406],
        [0.229,0.224,0.225]
    )
])


def generate_gradcam(
    image_path,
    model,
    output_path
):

    image = Image.open(image_path).convert("RGB")
    original_img = np.array(
        image
    ).astype(np.float32) / 255.0

    original_h, original_w = (
        original_img.shape[:2]
    )

    input_tensor = transform(
        image
    ).unsqueeze(0)

    target_layers = [
        model.features.denseblock4
    ]

    cam = GradCAM(
        model=model,
        target_layers=target_layers
    )

    grayscale_cam = cam(
        input_tensor=input_tensor
    )[0]

    grayscale_cam = cv2.resize(
        grayscale_cam,
        (
            original_w,
            original_h
        )
    )

    visualization = show_cam_on_image(
        original_img,
        grayscale_cam,
        use_rgb=True
    )

    cv2.imwrite(
        output_path,
        cv2.cvtColor(
            visualization,
            cv2.COLOR_RGB2BGR
        )
    )

    return output_path