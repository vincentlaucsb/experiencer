import { useEffect, useState } from "react";

import "./OverlayEditing.scss";

// Components
import Container from "@/resume/infrastructure/Container";

// Hooks
import useEditingControls from "./hooks/useEditingControls";
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

    const { cancel, save } = useEditingControls({
        isEditing,
        ctrlEnter: true,
        value: editValue,
        onChange: updateDataFields,
        toggleEditing: toggleEdit,
    });

    const handleSave = () => {
        updateDataFields({ value: tempSrc, altText: tempAlt });
        save();
    };

    const handleCancel = () => {
        setTempSrc(src);
        setTempAlt(altText);
        cancel();
    };

    useEffect(() => {
        if (isEditing) {
            setTempSrc(src);
            setTempAlt(altText);
        }
    }, [isEditing, src, altText]);

    const editContent = (
        <div className="resume-overlay-editor resume-overlay-editor--image app-gap-2 app-p-4" onClick={(e) => e.stopPropagation()}>
            <div className="resume-overlay-field app-gap-1">
                <label className="resume-overlay-label" htmlFor={`${props.uuid}-image-src`}>
                    Image Source (URL or Data URI):
                </label>
                <textarea
                    className="resume-overlay-input resume-overlay-textarea app-p-2"
                    id={`${props.uuid}-image-src`}
                    value={tempSrc}
                    onChange={(e) => setTempSrc(e.target.value)}
                    placeholder="https://example.com/image.png or data:image/png;base64,..."
                    autoFocus
                />
            </div>
            <div className="resume-overlay-field app-gap-1">
                <label className="resume-overlay-label" htmlFor={`${props.uuid}-image-alt`}>
                    Alt Text:
                </label>
                <input
                    className="resume-overlay-input app-p-2"
                    id={`${props.uuid}-image-alt`}
                    type="text"
                    value={tempAlt}
                    onChange={(e) => setTempAlt(e.target.value)}
                    placeholder="Image description"
                />
            </div>
            <div className="resume-overlay-actions app-gap-2">
                <button className="resume-overlay-cancel-button app-py-2 app-px-4" onClick={handleCancel}>
                    Cancel
                </button>
                <button className="resume-overlay-save-button app-py-2 app-px-4" onClick={handleSave}>
                    Save (Ctrl + Enter)
                </button>
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
