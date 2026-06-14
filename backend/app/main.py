import os
import uuid
import base64

from fastapi import FastAPI
from fastapi import UploadFile
from fastapi import File

from app.model import load_model
from app.predict import predict_image
from app.gradcam import generate_gradcam

app = FastAPI()

model = load_model()

os.makedirs("uploads", exist_ok=True)
os.makedirs("heatmaps", exist_ok=True)


@app.get("/")
def root():
    return {"message": "AI Image Detector API"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    file_id = str(uuid.uuid4())

    image_path = f"uploads/{file_id}.jpg"

    with open(image_path, "wb") as f:
        content = await file.read()
        f.write(content)

    result = predict_image(
        image_path,
        model
    )

    heatmap_path = (
        f"heatmaps/{file_id}_cam.jpg"
    )

    generate_gradcam(
        image_path=image_path,
        model=model,
        output_path=heatmap_path
    )

    with open(
        heatmap_path,
        "rb"
    ) as f:

        heatmap_base64 = (
            base64.b64encode(
                f.read()
            ).decode("utf-8")
        )

    os.remove(image_path)
    os.remove(heatmap_path)

    return {
        "prediction":
            result["prediction"],

        "confidence":
            round(
                result["confidence"] * 100,
                2
            ),

        "ai_probability":
            round(
                result["ai_probability"] * 100,
                2
            ),

        "real_probability":
            round(
                result["real_probability"] * 100,
                2
            ),

        "heatmap":
            heatmap_base64
    }