import * as React from "react";
import { IdType } from "./utility/HoverTracker";
import { CustomToolbarOptions, Action } from "./ResumeNodeBase";

export interface WrapperProps {
    children?: any;
    id: IdType;
    isSelected: boolean;
    customToolbar?: CustomToolbarOptions;
    updateToolbar: any;
}

// Represents a node that is part of the user's resume
export default function ResumeWrapper(props: WrapperProps) {
    React.useEffect(() => {
        if (props.isSelected) {
            if (props.customToolbar) {
                props.updateToolbar(props.customToolbar);
            }
        }
    },

    [props.id.join(' '), props.isSelected]);

    return <>
        {props.children}
    </>
}