// VideoUpload.js

import React, { useState } from "react";
import { toast } from "react-toastify";
import { uploadVideo } from "../services/api";

const VideoUpload = ({ onVideoUploaded }) => {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = async () => {
                if (video.duration > 150) {
                    toast.error("Video exceeds the maximum length of 150 seconds!");
                    return;
                }
                if (video.videoWidth > 1280 || video.videoHeight > 720) {
                    toast.error("Video dimensions exceed the maximum allowed size of 1280x720!");
                    return;
                }
                setProgress(0);
                setIsUploading(true);
                setShowModal(true);

                try {
                    const response = await uploadVideo(file, (event) => {
                        const loaded = event.loaded || 0;
                        let total = event.total || file.size;

                        const percentage = Math.round((loaded / total) * 100);
                        console.log(`Upload Progress: ${loaded}/${total} (${percentage}%)`);
                        setProgress(percentage);
                    });

                    if (response.success) {
                        onVideoUploaded(
                            response.videoUrl,
                            file.name,
                            video.videoWidth,
                            video.videoHeight,
                            file.size,
                            video.duration
                        );
                        toast.success("Video uploaded successfully!");
                    } else {
                        toast.error("Failed to upload video!");
                    }
                } catch (err) {
                    toast.error("An error occurred during upload!");
                } finally {
                    setIsUploading(false);
                    setShowModal(false);
                }
            };
        }
    };

    return (
        <>
            <div
                className="file-drop"
                onClick={() => document.getElementById("video-upload").click()}
            >
                <div className="file-drop-icon">📤</div>
                <div className="file-drop-text">Drag & drop or click to upload a video</div>
            </div>
            <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={isUploading}
            />

            {showModal && (
                <>
                    <div className="modal-overlay">
                        <div className="video-modal">
                            <h3>Uploading...</h3>
                            <p>Just give us a moment to process your file.</p>
                            <div className="modal-progress">
                                <div className="modal-loader">
                                    <span>{progress}%</span>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default VideoUpload;
