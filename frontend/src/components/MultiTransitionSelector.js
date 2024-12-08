// MultiTransitionSelector.js

import React from "react";
import "./MultiTransitionSelector.css"; // Create corresponding CSS

const MultiTransitionSelector = ({ numberOfTransitions, transitions, onTransitionChange, mediaItems }) => {
    const transitionOptions = [
        { value: "none", label: "None" },
        { value: "fade", label: "Fade" },
        { value: "wipeleft", label: "Wipe Left" },
        { value: "wiperight", label: "Wipe Right" },
        { value: "slideup", label: "Slide Up" },
        { value: "slidedown", label: "Slide Down" },
        // Add more transitions as needed
    ];

    return (
        <div className="multi-transition-selector">
            <h3>Select Transitions:</h3>
            {Array.from({ length: numberOfTransitions }, (_, index) => (
                <div key={index} className="transition-selector-item">
                    <h4>
                        Transition {index + 1}: Between {mediaItems[index].type === "image" ? "Image" : "Video"} {index + 1} and {mediaItems[index + 1].type === "image" ? "Image" : "Video"} {index + 2}
                    </h4>
                    <select
                        value={transitions[index] || "none"}
                        onChange={(e) => onTransitionChange(index, e.target.value)}
                    >
                        {transitionOptions.map((transition) => (
                            <option key={transition.value} value={transition.value}>
                                {transition.label}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
};

export default MultiTransitionSelector;
