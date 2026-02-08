import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import ResumeComponentProps from "@/types";
import { useIsNodeEditing, useEditorStore } from "@/shared/stores/editorStore";
import useEditingHotkeys from "./hooks/useEditingHotkeys";
import Container from "./Container";

/**
 * Markdown component - Freeform text with Markdown formatting support
 * 
 * Features:
 * - Edit mode: Plain textarea with Markdown syntax hints
 * - View mode: Rendered Markdown (headings, lists, bold, italic, links, code blocks, etc.)
 * - HTML support: Full HTML rendering (e.g., <img>, <br>) via rehype-raw
 * - Data URIs: Supports base64 encoded images (e.g., signatures)
 * - Printing/export: Renders as formatted HTML
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

    if (isEditing) {
        return (
            <Container className="markdown-editor" {...props}>
                <textarea
                    className="markdown-textarea"
                    id={props.uuid}
                    value={textValue}
                    onChange={(e) => props.updateData("value", e.target.value)}
                    placeholder={`# Markdown supported\n\n- Lists\n- **Bold** *italic* ~~strikethrough~~\n- [Links](url)\n- \`code\` or \`\`\`code blocks\`\`\``}
                />
                <button className="markdown-save-button" onClick={(e) => {
                    e.stopPropagation();
                    toggleEdit();
                }}>
                    Save (Ctrl + Enter)
                </button>
            </Container>
        );
    }

    return (
        <Container {...props} className="text-content">
            {textValue ? (
                <Markdown rehypePlugins={[rehypeRaw]}>{textValue}</Markdown>
            ) : (
                <span className="empty-placeholder">Click to add content</span>
            )}
        </Container>
    );
}

MarkdownText.type = 'Markdown';
