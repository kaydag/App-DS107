import os
import uuid
from fastapi import FastAPI
from fastapi import UploadFile
from fastapi import File
from app.model import load_model
from app.predict import predict_image
from app.gradcam import generate_gradcam
from app.db import supabase
from app.storage import upload_original, upload_heatmap
from app.history import save_analysis

app = FastAPI()
model = load_model()

os.makedirs("uploads",exist_ok=True)
os.makedirs("heatmaps",exist_ok=True)
@app.get("/history")
def history():

    data = (
        supabase
        .table(
            "analysis_history"
        )
        .select("*")
        .order(
            "created_at",
            desc=True
        )
        .execute()
    )

    return data.data
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    image_path = (f"uploads/{file_id}.jpg")
    with open(image_path,"wb") as f:
        content = await file.read()
        f.write(content)
    result = predict_image(image_path,model)
    heatmap_path = (f"heatmaps/{file_id}_cam.jpg")

    generate_gradcam(image_path=image_path,model=model,output_path=heatmap_path)
    original_url = upload_original(
    image_path
)

    heatmap_url = upload_heatmap(
        heatmap_path
)
    save_analysis({

        "filename":
        file.filename,

        "prediction":
        result["prediction"],

        "confidence":
        result["confidence"],

        "ai_probability":
        result["ai_probability"],

        "real_probability":
        result["real_probability"],

        "original_url":
        original_url,

        "heatmap_url":
        heatmap_url

})
    os.remove(image_path)
    os.remove(heatmap_path)
    return {
    "prediction": result["prediction"],
    "confidence": round(
        result["confidence"] * 100,
        2
    ),
    "heatmap_url": heatmap_url,
    }
