import React from "react";
import Container from "@/resume/infrastructure/Container";
import { process } from "@/shared/utils/processText";
import { useIsNodeEditing, useEditorStore } from "@/shared/stores/editorStore";
import ResumeComponentProps from "@/types";
import useEditingControls from "../hooks/useEditingControls";
import useEditing from "../hooks/useEditing";
import useAutoExpandInput from "../hooks/useAutoExpandInput";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";

interface LinkBase {
    url?: string;
}

export interface LinkProps extends ResumeComponentProps, LinkBase {}

const SAFE_LINK_SCHEME = /^(?:https?:|mailto:|tel:)/i;

function getSafeHref(url?: string) {
    const candidate = url?.trim();
    return candidate && SAFE_LINK_SCHEME.test(candidate) ? candidate : "#";
}

/**
 * Represents an external link in the resume
 */
function Link(props: LinkProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    const toggleEdit = useEditorStore((state) => state.toggleEdit);
    const displayText = process(props.value) as string || "Link text";
    const url = getSafeHref(props.url);

    const [editValue, setEditValue] = useEditing(
        props.value || '',
        isEditing,
        (newValue) => props.updateData("value", newValue)
    );
    const inputRef = React.useRef<HTMLInputElement>(null);
    useAutoExpandInput(inputRef);

    useEditingControls({
        isEditing,
        value: editValue,
        onChange: (originalValue) => props.updateData("value", originalValue),
        toggleEditing: toggleEdit,
        ctrlEnter: false
    });

    if (isEditing) {
        return (
            <Container displayAs="span" className="link-editing" {...props}>
                <input
                    {...nonCredentialInputAttributes}
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter link text"
                    autoFocus
                />
            </Container>
        );
    }

    return (
        <Container 
            displayAs="a" 
            className="link" 
            {...props} 
            onClick={(event) => event.preventDefault()}
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
