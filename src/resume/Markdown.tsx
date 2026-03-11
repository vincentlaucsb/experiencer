import type { MouseEvent } from "react";
import Markdown from "react-markdown";

import "./OverlayEditing.scss";
import "./Markdown.scss";

// Utilities
import useEditing from "./hooks/useEditing";
import useEditingControls from "./hooks/useEditingControls";

// Components
import Container from "@/resume/infrastructure/Container";

// Stores
import { useEditorStore, useIsNodeEditing } from "@/shared/stores/editorStore";

// Types
import ResumeComponentProps from "@/types";

/**
 * Markdown component - Freeform text with Markdown formatting support
 * 
 * Features:
 * - Edit mode: Plain textarea with Markdown syntax hints (displayed as overlay popover)
 * - View mode: Rendered Markdown (headings, lists, bold, italic, links, code blocks, etc.)
 * - Data URIs: Supports base64 encoded images (e.g., signatures)
 * - Printing/export: Renders as formatted HTML
 * - Stable layout: Editing UI overlays content without shifting layout
 * 
 * Default values by use case:
 * - General text: empty or "Click to add text"
 * - Bulleted list: "- " (single bullet prefix)
 * - Numbered list: "1. " (single number prefix)
 * - Section intro: "# " (heading prefix)
 */
export default function MarkdownText(props: ResumeComponentProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    const toggleEdit = useEditorStore((state) => state.toggleEdit);
    const textValue = props.value || "";
    
    // Local state for editing to prevent input reverting on every keystroke
    const [editValue, setEditValue] = useEditing(
        textValue, isEditing, 
        (newValue) => props.updateData("value", newValue)
    );
    
    const { cancel, save } = useEditingControls({
        isEditing,
        ctrlEnter: true,
        value: textValue,
        onChange: setEditValue, // Use setEditValue to update local state, not props.updateData
        toggleEditing: toggleEdit,
    });

    const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        cancel();
    };

    const handleSave = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        save();
    };

    const editContent = (
        <div className="resume-overlay-editor resume-overlay-editor--markdown app-gap-2 app-p-4" onClick={(e) => e.stopPropagation()}>
            <div className="resume-overlay-field app-gap-1">
                <textarea
                    className="resume-overlay-input resume-overlay-textarea app-p-2"
                    id={`${props.uuid}-markdown-input`}
                    aria-label="Markdown content"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`# Markdown supported\n\n- Lists\n- **Bold** *italic* ~~strikethrough~~\n- [Links](url)\n- \`code\` or \`\`\`code blocks\`\`\``}
                    autoFocus
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

    const displayContent = (
        <>
            {textValue ? (
                <Markdown>{textValue}</Markdown>
            ) : (
                <span className="empty-placeholder app-text-light-accent">Click to add content</span>
            )}
        </>
    );

    return (
        <Container 
            {...props} 
            className={`text-content ${isEditing ? 'editing' : ''}`}
            editContent={editContent}
        >
            {displayContent}
        </Container>
    );
}

MarkdownText.type = 'Markdown';
