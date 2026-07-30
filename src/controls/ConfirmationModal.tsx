import React from "react";

import { Button } from "@/controls/Buttons";
import Modal from "@/controls/Modal";

export interface ConfirmationModalProps {
    children: React.ReactElement;
    confirmLabel?: string;
    isOpen: boolean;
    title: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
    return (
        <Modal
            className="confirmation-modal"
            close={props.onCancel}
            isOpen={props.isOpen}
            title={props.title}
        >
            <div className="confirmation-modal-body">
                {props.children}
                <div className="confirmation-modal-actions">
                    <Button type="button" autoFocus onClick={props.onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="confirmation-modal-danger"
                        onClick={props.onConfirm}
                    >
                        {props.confirmLabel ?? "Confirm"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
