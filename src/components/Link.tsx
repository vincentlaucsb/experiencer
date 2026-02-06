import React, { useContext } from "react";
import Container from "./Container";
import { process } from "./Helpers";
import ResumeComponentProps from "./utility/Types";
import ResumeContext from "./ResumeContext";
import { useIsNodeEditing } from "../stores/editorStore";

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
    const displayText = process(props.value) as string || "Link text";
    const url = props.url || "#";

    if (isEditing) {
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
