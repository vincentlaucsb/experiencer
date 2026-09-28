import ReactModal from "react-modal";
import React from "react";
import ModalHeader from "./ModalHeader";

export interface ModalProps {
    children: React.ReactElement;
    close: () => void;
    isOpen: boolean;
    title: string;

    className?: string;
}

export default function Modal(props: ModalProps) {
    const appElement = typeof document === "undefined"
        ? undefined
        : document.getElementById("root") ?? undefined;
    const titleId = React.useId().replace(/:/g, "");

    // A className opts out of React Modal's default inline content styles.
    const className = props.className ? `app-modal ${props.className}` : "app-modal";

    return (
        <ReactModal
            isOpen={props.isOpen}
            className={className}
            contentLabel={props.title}
            role="dialog"
            aria={{ labelledby: titleId, modal: "true" }}
            onRequestClose={props.close}
            shouldReturnFocusAfterClose
            appElement={appElement}
            ariaHideApp={Boolean(appElement)}
        >
            <ModalHeader title={props.title} titleId={titleId} close={props.close} />
            <div className="modal-content app-p-4">
                {props.children}
            </div>
        </ReactModal>
    );
}
