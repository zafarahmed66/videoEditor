// TransitionSelector.js

import React from "react";
import "./TransitionSelector.css"; // Create a CSS file for styling

const TransitionSelector = ({ selectedTransition, onSelectTransition }) => {
    const transitions = [
        { value: "none", label: "None" },
        { value: "fade", label: "Fade" },
        { value: "wipeleft", label: "Wipe Left" },
        { value: "wiperight", label: "Wipe Right" },
        { value: "slideup", label: "Slide Up" },
        { value: "slidedown", label: "Slide Down" },
        // Add more transitions as needed
    ];

    return (
        <div className="transition-selector">
            <h3>Select a Transition:</h3>
            <ul>
                {transitions.map((transition) => (
                    <li key={transition.value}>
                        <label>
                            <input
                                type="radio"
                                name="transition"
                                value={transition.value}
                                checked={selectedTransition === transition.value}
                                onChange={() => onSelectTransition(transition.value)}
                            />
                            {transition.label}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransitionSelector;
