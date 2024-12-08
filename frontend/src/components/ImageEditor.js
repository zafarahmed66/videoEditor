// ImageEditor.js

import React, { useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from "react-konva";
import useImage from "use-image";
import "./ImageEditor.css";

const ImageEditor = ({ imageUrl, onImageEdited }) => {
    const stageRef = useRef(null);
    const [image] = useImage(imageUrl);
    const [texts, setTexts] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const addText = () => {
        const newText = {
            id: `text-${texts.length + 1}`,
            text: "New Text",
            x: 50,
            y: 50,
            fontSize: 24,
            draggable: true,
        };
        setTexts([...texts, newText]);
    };

    const handleDragEnd = (e, id) => {
        const updatedTexts = texts.map((txt) => {
            if (txt.id === id) {
                return {
                    ...txt,
                    x: e.target.x(),
                    y: e.target.y(),
                };
            }
            return txt;
        });
        setTexts(updatedTexts);
    };

    const handleTransformEnd = (e, id) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale to 1
        node.scaleX(1);
        node.scaleY(1);

        const updatedTexts = texts.map((txt) => {
            if (txt.id === id) {
                return {
                    ...txt,
                    x: node.x(),
                    y: node.y(),
                    fontSize: Math.max(12, txt.fontSize * scaleX),
                };
            }
            return txt;
        });
        setTexts(updatedTexts);
    };

    const handleTextChange = (e, id) => {
        const updatedTexts = texts.map((txt) => {
            if (txt.id === id) {
                return {
                    ...txt,
                    text: e.target.value,
                };
            }
            return txt;
        });
        setTexts(updatedTexts);
    };

    const deselect = (e) => {
        // Deselect when clicked on empty area
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
        }
    };

    const saveImage = () => {
        const uri = stageRef.current.toDataURL();
        // Convert dataURL to blob
        fetch(uri)
            .then((res) => res.blob())
            .then((blob) => {
                onImageEdited(blob);
            });
    };

    return (
        <div className="image-editor-container">
            <div className="toolbar">
                <button onClick={addText}>Add Text</button>
                <button onClick={saveImage}>Save Image</button>
            </div>
            <Stage
                width={600}
                height={400}
                ref={stageRef}
                onMouseDown={deselect}
                onTouchStart={deselect}
                className="konva-stage"
            >
                <Layer>
                    <KonvaImage image={image} />
                    {texts.map((txt, index) => (
                        <Text
                            key={txt.id}
                            id={txt.id}
                            text={txt.text}
                            x={txt.x}
                            y={txt.y}
                            fontSize={txt.fontSize}
                            draggable={txt.draggable}
                            onDragEnd={(e) => handleDragEnd(e, txt.id)}
                            onClick={() => setSelectedId(txt.id)}
                            onTap={() => setSelectedId(txt.id)}
                        />
                    ))}
                    {selectedId && (
                        <Transformer
                            anchorSize={8}
                            borderDash={[6, 2]}
                            rotateEnabled={false}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 30 || newBox.height < 30) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                            nodes={[stageRef.current.findOne(`#${selectedId}`)]}
                            onTransformEnd={(e) => handleTransformEnd(e, selectedId)}
                        />
                    )}
                </Layer>
            </Stage>
            {texts.map((txt) => (
                <div key={`input-${txt.id}`} className="text-input">
                    <label>Text {txt.id.split("-")[1]}:</label>
                    <input
                        type="text"
                        value={txt.text}
                        onChange={(e) => handleTextChange(e, txt.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ImageEditor;
