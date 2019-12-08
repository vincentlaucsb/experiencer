import * as React from "react";
import { ResumeComponentProps, Action } from "./ResumeComponent";

import AddIcon from "../icons/add-24px.svg";
import DeleteIcon from "../icons/delete-24px.svg";
import EditIcon from "../icons/edit-24px.svg";
import DoneIcon from "../icons/done-24px.svg";
import UpIcon from "../icons/keyboard_arrow_up-24px.svg";
import DownIcon from "../icons/keyboard_arrow_down-24px.svg";
import { Overlay, Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";

/**
 * HOC which returns a component wrapped with a tooltip
 * @param WrappedComponent Component to wrap with a tooltip
 * @param tooltip   Tooltip text
 * @param tooltipId ID of the tooltip container
 */
export function withTooltip(WrappedComponent,
    tooltip: string,
    tooltipId: string) {
    return class extends React.Component {
        constructor(props) {
            super(props);
        }

        render() {
            return <OverlayTrigger trigger="hover"
                delay={{ show: 500, hide: 0 }}
                placement="bottom"
                overlay={<Tooltip id={tooltipId}>{tooltip}</Tooltip>}>
                <WrappedComponent {...this.props} />
            </OverlayTrigger>
        }
    }
}

interface AddButtonProps {
    action: () => void;
    extended?: boolean;
}

interface ButtonProps extends ResumeComponentProps {
    extended?: boolean;
}

interface ButtonWithTooltipProps {
    onClick: () => void;
    tooltip: string;
    imgSrc: string;

    imgCls?: string;
}

function ButtonWithTooltip(props: ButtonWithTooltipProps) {
    const [show, setShow] = React.useState(false);
    const target: any = React.useRef(null);

    return <>
        <img
            className={props.imgCls}
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
    if (props.extended) {
        return <Button onClick={props.action}><img src={AddIcon} />Add</Button>
    }

    return <img onClick={props.action} src={AddIcon} alt='Add' />
}

export default function EditButton<P extends ButtonProps>(props: P) {
    let imgSrc = props.isEditing ? DoneIcon : EditIcon;
    let text = props.isEditing ? "Done" : "Edit";

    if (props.extended) {
        return <Button onClick={props.toggleEdit as Action}><img src={imgSrc} />{text}</Button>
    }

    return <ButtonWithTooltip onClick={props.toggleEdit as Action} imgSrc={imgSrc} tooltip="Edit" />
}

export function DeleteButton<P extends ResumeComponentProps>(props: P) {
    const [show, setShow] = React.useState(false);

    let confirmDelete = () => {
        (props.deleteChild as Action)();

        // Workaround
        setShow(false);
    }

    return <>
        <Modal show={show} onHide={() => setShow(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Are you sure?</p>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={confirmDelete} variant="danger">Delete</Button>
                <Button onClick={() => setShow(false)} variant="primary">Cancel</Button>
            </Modal.Footer>
        </Modal>

        <ExtendableButton action={() => setShow(true)} imgSrc={DeleteIcon} text='Delete' componentData={props} />
        </>
}

export function UpButton<P extends ResumeComponentProps>(props: P) {
    let imgCls = props.isFirst ? "button-disabled" : "";
    return <ExtendableButton imgCls={imgCls} imgSrc={UpIcon} text='Move Up' action={props.moveUp as Action} componentData={props} />
}

export function DownButton<P extends ButtonProps>(props: P) {
    if (props.extended) {
        return <Button onClick={props.moveDown as Action}><img src={DownIcon} />Move Down</Button>
    }

    let imgCls = props.isLast ? "button-disabled" : "";
    return <ButtonWithTooltip imgCls={imgCls} onClick={props.moveDown as Action} imgSrc={DownIcon} tooltip="Move Down" />
}

interface ExtendableButtonProps {
    componentData: ButtonProps;
    action: Action;
    text: string;
    imgSrc: string;

    imgCls?: string;
}

function ExtendableButton(props: ExtendableButtonProps) {
    const tooltip = props.text;
    const extended = props.componentData.extended;

    if (extended) {
        return <Button onClick={props.action}><img src={props.imgSrc} />{tooltip}</Button>
    }

    return <ButtonWithTooltip imgCls={props.imgCls} onClick={props.action} imgSrc={props.imgSrc} tooltip={tooltip} />
}