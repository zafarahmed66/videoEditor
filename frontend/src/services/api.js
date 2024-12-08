// api.js

import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/videos`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "multipart/form-data",
    },
    withCredentials: false,
});

export const uploadVideo = async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("video", file);

    const response = await axiosInstance.post("/upload", formData, {
        onUploadProgress,
    });

    return response.data;
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosInstance.post("/upload-image", formData);

    return response.data;
};
