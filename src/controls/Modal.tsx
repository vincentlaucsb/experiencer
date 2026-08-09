import ReactModal from "react-modal";
import React from "react";
import { CloseIcon } from "./InterfaceIcons";

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

    return (
        <ReactModal
            isOpen={props.isOpen}
            className={props.className}
            contentLabel={props.title}
            role="dialog"
            aria={{ labelledby: titleId, modal: "true" }}
            onRequestClose={props.close}
            shouldReturnFocusAfterClose
            appElement={appElement}
            ariaHideApp={Boolean(appElement)}
        >
            <h3 id={titleId} className="modal-heading app-py-2 app-px-4">
                {props.title}
                <button
                    type="button"
                    className="modal-close app-p-0"
                    aria-label={`Close ${props.title}`}
                    onClick={() => props.close()}>
                    <CloseIcon />
                </button>
            </h3>
            <div className="modal-content app-p-4">
                {props.children}
            </div>
        </ReactModal>
    );
}
