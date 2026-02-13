import React, { useState } from "react";

// Components
import Container from "@/resume/infrastructure/Container";

// Hooks
import useEditingHotkeys from "./hooks/useEditingHotkeys";
import { useEditorStore, useIsNodeEditing } from "@/shared/stores/editorStore";

// Types
import ResumeComponentProps, { BasicResumeNode } from "@/types";

interface ImageBase {
    altText?: string;
}

export interface BasicImageProps extends BasicResumeNode<ImageBase> { }
export interface ImageProps extends ResumeComponentProps<ImageBase> { }

/**
 * Image component - Displays images from URLs or data URIs
 * 
 * Features:
 * - Renders any image URL or base64 data URI
 * - Commonly used for logos, signatures, headshots
 * - Maps `value` prop to `src` attribute
 * - Supports all standard image formats (PNG, JPEG, SVG, etc.)
 * 
 * Example values:
 * - URL: "https://example.com/logo.png"
 * - Data URI: "data:image/png;base64,iVBORw0KG..."
 * - Relative: "/assets/photo.jpg"
 */
export default function Image({ updateDataFields, ...props }: ImageProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    const toggleEdit = useEditorStore((state) => state.toggleEdit);
    const [tempSrc, setTempSrc] = useState(props.value || "");
    const [tempAlt, setTempAlt] = useState(props.altText || "");

    const src = props.value || "";
    const altText = props.altText || "Image";

    const editValue = {
        value: src,
        altText: altText,
    };

    useEditingHotkeys({
        isEditing,
        ctrlEnter: true,
        value: editValue,
        onChange: updateDataFields,
        toggleEditing: toggleEdit,
    });

    const handleSave = () => {
        updateDataFields({ value: tempSrc, altText: tempAlt });
        toggleEdit();
    };

    const editContent = (
        <div className="resume-image-editor" style={{ padding: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Image Source (URL or Data URI):
                </label>
                <textarea
                    value={tempSrc}
                    onChange={(e) => setTempSrc(e.target.value)}
                    placeholder="https://example.com/image.png or data:image/png;base64,..."
                    style={{ 
                        width: '100%', 
                        minHeight: '80px', 
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        padding: '5px'
                    }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Alt Text:
                </label>
                <input
                    type="text"
                    value={tempAlt}
                    onChange={(e) => setTempAlt(e.target.value)}
                    placeholder="Image description"
                    style={{ width: '100%', padding: '5px' }}
                />
            </div>
            <div>
                <button onClick={handleSave} style={{ padding: '5px 15px' }}>Save</button>
            </div>
        </div>
    );

    return (
        <Container 
            {...props}
            displayAs="img"
            attributes={{
                src: src,
                alt: altText
            }}
            className="resume-image"
            editContent={editContent}
        />
    );
}

Image.type = 'Image';
