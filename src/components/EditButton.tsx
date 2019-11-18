import * as React from "react";
import { EditableProps } from "./Editable";

export default function EditButton<P extends EditableProps>(props: P) {
    if (props.isEditing) {
        return <button onClick={props.toggleEdit}>Done</button>
    }

    return <button onClick={props.toggleEdit}>Edit</button>
}