import { useState, useEffect } from "react";
import Markdown from "react-markdown";

import "./Markdown.scss";

// Utilities
import useEditingHotkeys from "./hooks/useEditingHotkeys";

// Components
import Container from "@/resume/infrastructure/Container";

// Stores
import { useEditorStore, useIsNodeEditing } from "@/shared/stores/editorStore";

// Types
import ResumeComponentProps from "@/types";
import useEditing from "./hooks/useEditing";

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
    
    useEditingHotkeys({
        isEditing,
        ctrlEnter: true,
        value: textValue,
        onChange: setEditValue, // Use setEditValue to update local state, not props.updateData
        toggleEditing: toggleEdit,
    });

    const editContent = (
        <div className="markdown-editor-overlay app-gap-2 app-p-4" onClick={(e) => e.stopPropagation()}>
            <textarea
                className="markdown-textarea app-p-2"
                id={props.uuid}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`# Markdown supported\n\n- Lists\n- **Bold** *italic* ~~strikethrough~~\n- [Links](url)\n- \`code\` or \`\`\`code blocks\`\`\``}
                autoFocus
            />
            <button className="markdown-save-button app-py-2 app-px-4 app-bg-main app-text-light-shade" onClick={(e) => {
                e.stopPropagation();
                toggleEdit();
            }}>
                Save (Ctrl + Enter)
            </button>
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
