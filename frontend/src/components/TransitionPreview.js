// TransitionPreview.js

import React from "react";
import "./TransitionPreview.css"; // Create corresponding CSS

const TransitionPreview = ({ mediaItems, transitions }) => {
    if (mediaItems.length === 0) {
        return <p>No media items to display.</p>;
    }

    return (
        <div className="transition-preview">
            <h3>Media Sequence with Transitions</h3>
            <ul>
                {mediaItems.map((item, index) => (
                    <li key={index} className="media-item">
                        <div className="media-content">
                            {item.type === "image" ? (
                                <img src={item.url} alt={`Media ${index + 1}`} />
                            ) : (
                                <video src={item.url} controls />
                            )}
                        </div>
                        {index < mediaItems.length - 1 && (
                            <div className="transition-info">
                                <p>
                                    <strong>Transition {index + 1}:</strong> {transitions[index] || "None"}
                                </p>
                                <div className="transition-preview-box">
                                    {/* Visual representation of the transition */}
                                    <div
                                        className={`transition-${transitions[index] || "none"}`}
                                        data-tip={`Transition effect: ${transitions[index] || "None"}`}
                                    >
                                        {transitions[index] ? (
                                            <span>{transitions[index]}</span>
                                        ) : (
                                            <span>No Transition</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransitionPreview;
