import Markdown from "react-markdown";

// Utilities
import useEditingHotkeys from "./hooks/useEditingHotkeys";

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

    useEditingHotkeys({
        isEditing,
        ctrlEnter: true,
        value: textValue,
        onChange: (newValue) => props.updateData("value", newValue),
        toggleEditing: toggleEdit,
    });

    const editContent = (
        <div className="markdown-editor-overlay" onClick={(e) => e.stopPropagation()}>
            <textarea
                className="markdown-textarea"
                id={props.uuid}
                value={textValue}
                onChange={(e) => props.updateData("value", e.target.value)}
                placeholder={`# Markdown supported\n\n- Lists\n- **Bold** *italic* ~~strikethrough~~\n- [Links](url)\n- \`code\` or \`\`\`code blocks\`\`\``}
                autoFocus
            />
            <button className="markdown-save-button" onClick={(e) => {
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
                <span className="empty-placeholder">Click to add content</span>
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
