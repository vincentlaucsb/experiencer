import type * as React from "react";

import { Button } from "@/controls/Buttons";
import type { Action } from "@/types";

interface AccountControlsProps {
    accountLabel?: string;
    editingStorage?: "local" | "cloud";
    isEditing: boolean;
    saveStatus?: string;
    secondaryItems?: React.ReactNode;
    signIn?: Action;
    signOut?: Action;
}

/** Renders save status, account identity, extensions, and authentication commands. */
export default function AccountControls(props: AccountControlsProps) {
    return (
        <div className="brand-secondary">
            {props.isEditing && props.saveStatus
                ? <span className="save-status">{props.saveStatus}</span>
                : <></>}
            {props.accountLabel ? (
                <span
                    className={`account-label account-label--${props.editingStorage ?? "unknown"}`}
                    title={props.accountLabel}
                    aria-label={props.accountLabel}
                >
                    {props.editingStorage ? (
                        <span
                            className={`account-mode-icon account-mode-icon--${props.editingStorage}`}
                            aria-hidden="true"
                        >
                            <i className="icofont-cloud" />
                        </span>
                    ) : <></>}
                    <span className="account-label-text">{props.accountLabel}</span>
                </span>
            ) : <></>}
            <span className="top-nav-secondary-extension">{props.secondaryItems}</span>
            {props.signOut ? (
                <Button onClick={props.signOut} aria-label="Sign out">
                    <i className="icofont-sign-out" aria-hidden="true" />
                    <span className="top-nav-auth-label">Sign out</span>
                </Button>
            ) : <></>}
            {props.signIn ? (
                <Button onClick={props.signIn} aria-label="Log in">
                    <i className="icofont-sign-in" aria-hidden="true" />
                    <span className="top-nav-auth-label">Log in</span>
                </Button>
            ) : <></>}
        </div>
    );
}
