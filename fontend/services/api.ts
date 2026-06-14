import axios from "axios";

const API_URL = "http://app-ds107-production.up.railway.app";

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
