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

interface TooltipProps {
    onClick: () => void;
    tooltip: string;
    imgSrc: string;
}

function ButtonWithTooltip(props: TooltipProps) {
    const [show, setShow] = React.useState(false);
    const target: any = React.useRef(null);

    return <>
        <img
            ref={target}
            onMouseEnter={() => setShow(true)}
            onMouseOut={() => setShow(false)}
            onClick={props.onClick} src={props.imgSrc} alt={props.tooltip} />
        <Overlay
            target={target.current}
            show={show}
            placement='top'>
            <div className="button-tooltip">{props.tooltip}</div>
        </Overlay>
    </>
}

export function AddButton(props: AddButtonProps) {
    return <img onClick={props.action} src={AddIcon} alt='Add' />
}

export default function EditButton<P extends ResumeComponentProps>(props: P) {
    let imgSrc = props.isEditing ? DoneIcon : EditIcon;
    return <ButtonWithTooltip onClick={props.toggleEdit as Action} imgSrc={imgSrc} tooltip="Edit" />
}

export function DeleteButton<P extends ResumeComponentProps>(props: P) {
    return <ButtonWithTooltip onClick={props.deleteChild as Action} imgSrc={DeleteIcon} tooltip="Delete" />
}

export function UpButton<P extends ResumeComponentProps>(props: P) {
    return <ButtonWithTooltip onClick={props.moveUp as Action} imgSrc={UpIcon} tooltip="Move Up" />
}

export function DownButton<P extends ResumeComponentProps>(props: P) {
    return <ButtonWithTooltip onClick={props.moveDown as Action} imgSrc={DownIcon} tooltip="Move Down" />
}