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
    return (
        <ReactModal isOpen={props.isOpen} className={props.className}>
            <h3 className="modal-heading app-py-2 app-px-4">
                {props.title}
                <button
                    className="modal-close app-p-0"
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