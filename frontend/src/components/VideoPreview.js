// VideoPreview.js

import React, { useState } from "react";

const VideoPreview = ({ videos }) => {
    const [modalVideo, setModalVideo] = useState(null);

    return (
        <>
            <div className="video-grid">
                {videos.map((video, index) => (
                    <div
                        key={index}
                        className="video-card"
                        onClick={() => setModalVideo(video)}
                    >
                        <video src={video.url} controls></video>
                        <div className="video-info">
                            <p>Name: {video.name}</p>
                            <p>
                                Resolution: {video.width}x{video.height}
                            </p>
                            <p>Size: {(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                            <p>Length: {Math.floor(video.duration)} sec</p>
                        </div>
                    </div>
                ))}
            </div>

            {modalVideo && (
                <>
                    <div className="modal-overlay" onClick={() => setModalVideo(null)}></div>
                    <div className="video-modal">
                        <video src={modalVideo.url} controls autoPlay></video>
                        <div className="modal-info">
                            <h3>{modalVideo.name}</h3>
                            <p>
                                Resolution: {modalVideo.width}x{modalVideo.height}
                            </p>
                            <p>Size: {(modalVideo.size / (1024 * 1024)).toFixed(2)} MB</p>
                            <p>Length: {Math.floor(modalVideo.duration)} sec</p>
                        </div>
                        <button onClick={() => setModalVideo(null)}>Close</button>
                    </div>
                </>
            )}
        </>
    );
};

export default VideoPreview;
