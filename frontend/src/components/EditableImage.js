// EditableImage.js

import React from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

const EditableImage = ({ element, handleDragEnd, handleSelect }) => {
    const [image] = useImage(element.url);

    return (
        <KonvaImage
            id={element.id}
            image={image}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            draggable={element.draggable}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onClick={() => handleSelect(element.id)}
            onTap={() => handleSelect(element.id)}
        />
    );
};

export default EditableImage;
