// ImageUpload.js

import React, { useState } from "react";
import { toast } from "react-toastify";
import { uploadImage } from "../services/api";
import ImageEditor from "./ImageEditor";
import "./ImageUpload.css"; // Ensure you have styles for this component

const ImageUpload = ({ onImageUploaded }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [editedImage, setEditedImage] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [originalImageUrl, setOriginalImageUrl] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.src = url;
            img.onload = async () => {
                if (img.width > 1280 || img.height > 720) {
                    toast.error("Image dimensions exceed the maximum allowed size of 1280x720!");
                    return;
                }
                setOriginalImageUrl(url);
                setShowEditor(true);
            };
        }
    };

    const handleImageEdited = async (blob) => {
        setEditedImage(blob);
        setShowEditor(false);
        setIsUploading(true);
        try {
            const response = await uploadImage(blob);
            if (response.success) {
                onImageUploaded(response.imageUrl);
                toast.success("Image uploaded successfully!");
            } else {
                toast.error("Failed to upload image!");
            }
        } catch (err) {
            toast.error("An error occurred during image upload!");
        } finally {
            setIsUploading(false);
            URL.revokeObjectURL(originalImageUrl);
        }
    };

    const handleCancelEdit = () => {
        setShowEditor(false);
        URL.revokeObjectURL(originalImageUrl);
    };

    return (
        <div className="image-upload-container">
            {!showEditor ? (
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </div>
            ) : (
                <div>
                    <ImageEditor imageUrl={originalImageUrl} onImageEdited={handleImageEdited} />
                    <button onClick={handleCancelEdit} className="cancel-edit-button">
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
