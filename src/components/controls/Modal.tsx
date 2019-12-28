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
            <h3 className="modal-heading">
                {props.title}
                <button
                    className="modal-close"
                    onClick={() => props.close()}>
                    <CloseIcon />
                </button>
            </h3>
            <div className="modal-content">
                {props.children}
            </div>
        </ReactModal>
    );
}