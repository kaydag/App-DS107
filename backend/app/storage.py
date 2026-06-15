import uuid
from app.db import supabase

def upload_heatmap(
    heatmap_path
):
    filename = (
        f"{uuid.uuid4()}.jpg"
    )
    with open(
        heatmap_path,
        "rb"
    ) as f:
        supabase.storage \
            .from_("heatmaps") \
            .upload(
                filename,
                f,
                {
                    "content-type":
                    "image/jpeg"
                }
            )
    return (
        supabase.storage
        .from_("heatmaps")
        .get_public_url(
            filename
        )
    )
def upload_original(
    image_path
):

    filename = (
        f"{uuid.uuid4()}.jpg"
    )

    with open(
        image_path,
        "rb"
    ) as f:

        supabase.storage \
            .from_("original-images") \
            .upload(
                filename,
                f
            )

    return (
        supabase.storage
        .from_("original-images")
        .get_public_url(
            filename
        )
    )