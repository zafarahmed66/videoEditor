import React, { useState, useRef, useEffect } from "react";

const CombinedVideoPlayer = ({ videos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef();

    const handleEnded = () => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    };

    useEffect(() => {
        // Play the current video when currentIndex changes
        if (videoRef.current) {
            videoRef.current.load(); // Load the new video
            videoRef.current.play().catch((error) => {
                console.error("Error playing video:", error);
            });
        }
    }, [currentIndex]);

    return (
        <>
            {videos.length === 0 ? (
                <p>No videos uploaded yet.</p>
            ) : (
                <video
                    ref={videoRef}
                    key={currentIndex} // Ensure the video element resets for each new video
                    onEnded={handleEnded}
                    controls
                    style={{ width: "100%", borderRadius: "8px" }}
                >
                    <source src={videos[currentIndex].url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
        </>
    );
};

export default CombinedVideoPlayer;
