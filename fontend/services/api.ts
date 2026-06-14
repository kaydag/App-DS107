import axios from "axios";

const API_URL = "http://192.168.1.75:8000";

export const predictImage = async (imageUri: string) => {
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: "image.jpg",
    type: "image/jpeg",
  } as any);

  const response = await axios.post(`${API_URL}/predict`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
