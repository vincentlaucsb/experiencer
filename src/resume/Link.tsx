import React, { useContext } from "react";
import { process } from "@/shared/utils/Helpers";
import ResumeComponentProps from "@/types";
import ResumeContext from "@/shared/utils/ResumeContext";
import { useIsNodeEditing, useEditorStore } from "@/shared/stores/editorStore";
import useEditingHotkeys from "./hooks/useEditingHotkeys";
import Container from "@/resume/infrastructure/Container";

interface LinkBase {
    url?: string;
}

export interface LinkProps extends ResumeComponentProps, LinkBase {}

/**
 * Represents an external link in the resume
 */
function Link(props: LinkProps) {
    const context = useContext(ResumeContext);
    const isEditing = useIsNodeEditing(props.uuid);
    const toggleEdit = useEditorStore((state) => state.toggleEdit);
    const displayText = process(props.value) as string || "Link text";
    const url = props.url || "#";

    useEditingHotkeys({
        isEditing,
        value: props.value || '',
        onChange: (originalValue) => props.updateData("value", originalValue),
        toggleEditing: toggleEdit,
        ctrlEnter: false
    });

    if (isEditing && !context.isPrinting) {
        return (
            <Container displayAs="span" className="link-editing" {...props}>
                <input
                    type="text"
                    value={props.value || ''}
                    onChange={(e) => props.updateData("value", e.target.value)}
                    placeholder="Enter link text"
                    autoFocus
                />
            </Container>
        );
    }

    // In the editor, render as span to prevent navigation
    // In print/export mode, render as actual link
    if (!context.isPrinting) {
        return (
            <Container 
                displayAs="span" 
                className="link" 
                {...props}
            >
                {displayText}
            </Container>
        );
    }

    return (
        <Container 
            displayAs="a" 
            className="link" 
            {...props} 
            attributes={{
                href: url,
                target: "_blank",
                rel: "noopener noreferrer"
            }}
        >
            {displayText}
        </Container>
    );
}

Link.type = 'Link';

export default Link;
