import * as React from "react";
import { IdType } from "./utility/HoverTracker";
import { CustomToolbarOptions, Action } from "./ResumeNodeBase";

export interface WrapperProps {
    children?: any;
    id: IdType;
    isSelected: boolean;
    customToolbar?: CustomToolbarOptions;
    updateToolbar: any;
    toggleEdit: Action;
    isEditing?: boolean;
}

// Represents a node that is part of the user's resume
export default function ResumeWrapper(props: WrapperProps) {
    React.useEffect(() => {
        if (props.isSelected) {
            if (props.customToolbar) {
                props.updateToolbar(props.customToolbar);
            }
        }
        else if (props.isEditing) {
            // A user was editing a node but selected 
            // another node while editing
            props.toggleEdit();
        }
    },

    [props.id.join(' '), props.isSelected]);

    return <>
        {props.children}
    </>
}