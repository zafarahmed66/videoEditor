// Dashboard.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoUpload from "../components/VideoUpload";
import VideoPreview from "../components/VideoPreview";
import ImageUpload from "../components/ImageUpload";
import MultiTransitionSelector from "../components/MultiTransitionSelector";
import TransitionPreview from "../components/TransitionPreview";
import { toast } from "react-toastify";
// import "./Dashboard.css";

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [mergedVideoUrl, setMergedVideoUrl] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const [firstImageUrl, setFirstImageUrl] = useState(null);
  const [lastImageUrl, setLastImageUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("upload"); // 'upload', 'edit-images', 'transitions'
  const [firstImageDuration, setFirstImageDuration] = useState(3);
  const [lastImageDuration, setLastImageDuration] = useState(3);
  const [transitions, setTransitions] = useState([]); // Array of transitions

  // Update transitions when media items change
  useEffect(() => {
    const numberOfTransitions = calculateNumberOfTransitions();
    setTransitions((prevTransitions) => {
      const newTransitions = [...prevTransitions];
      while (newTransitions.length < numberOfTransitions) {
        newTransitions.push("none"); // Default transition
      }
      while (newTransitions.length > numberOfTransitions) {
        newTransitions.pop();
      }
      return newTransitions;
    });
  }, [videos, firstImageUrl, lastImageUrl]);

  const calculateNumberOfTransitions = () => {
    const mediaCount = videos.length;
    let count = mediaCount;
    if (firstImageUrl) count += 1;
    if (lastImageUrl) count += 1;
    return count > 0 ? count - 1 : 0;
  };

  const handleTransitionChange = (index, value) => {
    setTransitions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleVideoUploaded = (url, name, width, height, size, duration) => {
    setVideos([...videos, { url, name, width, height, size, duration }]);
  };

  const handlePreviewClick = async () => {
    if (videos.length === 0 && !firstImageUrl && !lastImageUrl) {
      alert(
        "Please upload at least one video or image to preview the combined video!"
      );
      return;
    }

    setIsMerging(true);

    try {
      const videoUrls = videos.map((video) => video.url);
      const requestBody = {};

      if (videoUrls.length > 0) {
        requestBody.videoUrls = videoUrls;
      }
      if (firstImageUrl) {
        requestBody.firstImageUrl = firstImageUrl;
        requestBody.firstImageDuration = Number(firstImageDuration) || 3;
      }
      if (lastImageUrl) {
        requestBody.lastImageUrl = lastImageUrl;
        requestBody.lastImageDuration = Number(lastImageDuration) || 3;
      }

      // Include transitions as an array in the request
      requestBody.transitions = transitions;

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos/merge-videos`,
        requestBody,
        {
          responseType: "blob",
          onDownloadProgress: (event) => {
            const loaded = event.loaded || 0;
            const total = event.total || 1;
            const percentage = Math.round((loaded / total) * 100);
            console.log(
              `Download Progress: ${loaded}/${total} (${percentage}%)`
            );
          },
        }
      );

      const contentType = response.headers["content-type"];

      if (contentType && contentType.includes("application/json")) {
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const errorData = JSON.parse(reader.result);
            console.error("Error merging videos:", errorData);
            toast.error(
              `Failed to merge videos: ${errorData.message || "Unknown error"}`
            );
          } catch (e) {
            console.error("Error parsing error response:", e);
            toast.error(`Failed to merge videos: ${e.message}`);
          }
          setIsMerging(false);
        };
        reader.readAsText(response.data);
      } else {
        const mergedVideoBlob = new Blob([response.data], {
          type: "video/mp4",
        });
        const mergedVideoUrl = URL.createObjectURL(mergedVideoBlob);
        setMergedVideoUrl(mergedVideoUrl);
        toast.success("Videos merged successfully!");
        setIsMerging(false);
      }
    } catch (error) {
      let errorMsg = error.message;
      if (error.response && error.response.data) {
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const errorData = JSON.parse(reader.result);
            errorMsg = errorData.message || errorMsg;
            console.error("Error merging videos:", errorData);
            toast.error(`Failed to merge videos: ${errorMsg}`);
          } catch (e) {
            console.error("Error parsing error response:", e);
            toast.error(`Failed to merge videos: ${errorMsg}`);
          }
          setIsMerging(false);
        };
        reader.readAsText(error.response.data);
      } else {
        console.error("Error merging videos:", errorMsg);
        toast.error(`Failed to merge videos: ${errorMsg}`);
        setIsMerging(false);
      }
    }
  };

  const mediaItems = [
    ...(firstImageUrl ? [{ type: "image", url: firstImageUrl }] : []),
    ...videos.map((video) => ({ type: "video", url: video.url })),
    ...(lastImageUrl ? [{ type: "image", url: lastImageUrl }] : []),
  ];

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Demo Reel Maker</h2>
        <button onClick={() => setActiveTab("upload")}>Upload Videos</button>
        <button onClick={() => setActiveTab("edit-images")}>Edit Images</button>
        <button onClick={() => setActiveTab("transitions")}>
          Apply Transitions
        </button>
        <button onClick={handlePreviewClick}>Preview Combined Video</button>
      </div>
      <div className="main-content">
        {activeTab === "upload" && (
          <>
            <h1>Upload Videos</h1>
            <VideoUpload onVideoUploaded={handleVideoUploaded} />
            <VideoPreview videos={videos} />
          </>
        )}

        {activeTab === "edit-images" && (
          <>
            <h1>Edit Images</h1>
            <div className="edit-images-container">
              <div className="image-upload-section card">
                <h3>First Image</h3>
                <ImageUpload onImageUploaded={(url) => setFirstImageUrl(url)} />
                {firstImageUrl && (
                  <>
                    <img
                      src={firstImageUrl}
                      alt="First Image Preview"
                      className="image-preview"
                    />
                    <div className="duration-input">
                      <label htmlFor="firstImageDuration">
                        Display Duration (seconds):
                      </label>
                      <input
                        id="firstImageDuration"
                        type="number"
                        min="1"
                        max="30"
                        value={firstImageDuration}
                        onChange={(e) => setFirstImageDuration(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="image-upload-section card">
                <h3>Last Image</h3>
                <ImageUpload onImageUploaded={(url) => setLastImageUrl(url)} />
                {lastImageUrl && (
                  <>
                    <img
                      src={lastImageUrl}
                      alt="Last Image Preview"
                      className="image-preview"
                    />
                    <div className="duration-input">
                      <label htmlFor="lastImageDuration">
                        Display Duration (seconds):
                      </label>
                      <input
                        id="lastImageDuration"
                        type="number"
                        min="1"
                        max="30"
                        value={lastImageDuration}
                        onChange={(e) => setLastImageDuration(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "transitions" && (
          <>
            <h1>Apply Transitions</h1>
            <TransitionPreview
              mediaItems={mediaItems}
              transitions={transitions}
            />
            <MultiTransitionSelector
              numberOfTransitions={calculateNumberOfTransitions()}
              transitions={transitions}
              onTransitionChange={handleTransitionChange}
              mediaItems={mediaItems}
            />
          </>
        )}
      </div>

      {isMerging && (
        <>
          <div className="modal-overlay">
            <div className="video-modal">
              <h3>Merging Videos...</h3>
              <p>Please wait while we process your videos.</p>
              <div className="modal-progress">
                <div className="modal-loader"></div>
              </div>
              <button onClick={() => setIsMerging(false)}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {mergedVideoUrl && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setMergedVideoUrl(null)}
          ></div>
          <div className="video-modal">
            <h3>Preview Combined Video</h3>
            <video src={mergedVideoUrl} controls style={{ width: "100%" }} />
            <button onClick={() => setMergedVideoUrl(null)}>Close</button>
          </div>
        </>
      )}
    </div>
  );
};
export default Dashboard;
