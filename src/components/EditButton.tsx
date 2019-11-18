import * as React from "react";
import { ResumeComponentProps, Action } from "./ResumeComponent";

export default function EditButton<P extends ResumeComponentProps>(props: P) {
    if (props.isEditing && props.toggleEdit as Action) {
        return <button onClick={props.toggleEdit as Action}>Done</button>
    }

    return <button onClick={props.toggleEdit as Action}>Edit</button>
}