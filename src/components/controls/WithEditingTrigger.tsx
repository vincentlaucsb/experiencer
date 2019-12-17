import React from "react";
import ResumeNodeBase from "../ResumeNodeBase";
import { process } from "../Helpers";

export interface EditTriggerProps {
    isEditing?: boolean;

    /** A callback which modifies the display text */
    displayProcessor?: (text?: string) => string;

    /** Callback when display text is clicked */
    onClick?: () => void;

    /** Callback when enter key is pressed */
    onEnterDown?: () => void;
}

export interface TriggerOptions {
    disableEnter?: boolean;
}

/**
 * Higher order component which gives an editing control the ablity
 * to switch into "Edit" mode when clicked or when the Enter key
 * is pressed
 * 
 * ALSO: This also performs text processing on the text contents
 * 
 * @param WrappedComponent A function component
 * @param parent           Resume node containing the editor
 */
export default function withEditingTrigger<P extends EditTriggerProps>(
    WrappedComponent: (props: P) => JSX.Element,
    parent: ResumeNodeBase,
    triggerOptions: TriggerOptions = {}
) {
    const textFieldProps = {
        displayProcessor: process,
        isEditing: parent.props.isEditing && parent.isSelected,
        onClick: parent.isSelected ? parent.toggleEdit : undefined,
        onEnterDown: triggerOptions.disableEnter ? undefined : parent.toggleEdit
    };

    return class extends React.Component<P> {
        render() {
            return <WrappedComponent
                {...this.props}
                {...textFieldProps}
            />
        }
    }
}