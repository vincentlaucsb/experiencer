import React from "react";
import { Button } from "./Buttons";
import { CloseIcon } from "./InterfaceIcons";

export interface ModalHeaderProps {
    title: string;
    titleId: string;
    subtitle?: string;
    close?: () => void;
    closeDisabled?: boolean;
}

/** Shared presentation for both React Modal and native dialog shells. */
export default function ModalHeader(props: ModalHeaderProps) {
    return (
        <header className="modal-header">
            <div className="modal-header__titles">
                <h2 id={props.titleId} className="modal-header__title">{props.title}</h2>
                {props.subtitle && <p className="modal-header__subtitle">{props.subtitle}</p>}
            </div>
            {props.close && (
                <Button type="button" className="modal-header__close" disabled={props.closeDisabled}
                    aria-label={`Close ${props.title}`} title={`Close ${props.title}`} onClick={props.close}>
                    <span aria-hidden="true"><CloseIcon /></span>
                </Button>
            )}
        </header>
    );
}
