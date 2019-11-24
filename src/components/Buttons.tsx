import * as React from "react";
import { ResumeComponentProps, Action } from "./ResumeComponent";

import AddIcon from "../icons/add-24px.svg";
import DeleteIcon from "../icons/delete-24px.svg";
import EditIcon from "../icons/edit-24px.svg";
import DoneIcon from "../icons/done-24px.svg";
import UpIcon from "../icons/keyboard_arrow_up-24px.svg";
import DownIcon from "../icons/keyboard_arrow_down-24px.svg";
import { Overlay } from "react-bootstrap";

interface AddButtonProps {
    action: () => void;
}

export function AddButton(props: AddButtonProps) {
    return <img onClick={props.action} src={AddIcon} alt='Add' />
}

export default function EditButton<P extends ResumeComponentProps>(props: P) {
    const editIcon = <img src={EditIcon} alt='Edit' />

    if (props.isEditing && props.toggleEdit as Action) {
        return <img onClick={props.toggleEdit as Action} src={DoneIcon} alt='Edit' />
    }

    return <img onClick={props.toggleEdit as Action} src={EditIcon} alt='Edit' />
}

export function DeleteButton<P extends ResumeComponentProps>(props: P) {
    const [show, setShow] = React.useState(false);
    const target: any = React.useRef(null);

    return <>
        <img
            ref={target}
            onMouseEnter={() => setShow(true)}
            onMouseOut={() => setShow(false)}
            onClick={props.deleteChild as Action} src={DeleteIcon} alt='Delete' />
        <Overlay
            target={target.current}
            show={show}
            placement='top'>
            <div className="button-tooltip">Delete</div>
        </Overlay>
    </>
}

export function UpButton<P extends ResumeComponentProps>(props: P) {
    return <img onClick={props.moveUp as Action} src={UpIcon} alt='Move Up' />
}

export function DownButton<P extends ResumeComponentProps>(props: P) {
    return <img onClick={props.moveDown as Action} src={DownIcon} alt='Move Down' />
}