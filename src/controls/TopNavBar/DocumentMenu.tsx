import * as React from "react";
import type { MenuItem } from "popright";

import AsyncActionForm from "@/controls/AsyncActionForm";
import { Button } from "@/controls/Buttons";
import Modal from "@/controls/Modal";
import Dropdown from "@/controls/menus/Dropdown";
import { createPoprightIcon } from "@/controls/menus/poprightMenu";
import {
    RESUME_TITLE_MAX_LENGTH,
    type ResumeDocumentSummary
} from "@/shared/repositories/ResumeRepository";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";

interface DocumentMenuProps {
    activeDocumentId?: string;
    documentLabels?: Record<string, string>;
    documents: ResumeDocumentSummary[];
    renameDocument?: (id: string, title: string) => Promise<string | null>;
    selectDocument?: (id: string) => void;
}

interface RenameState {
    documentId: string;
    title: string;
}

/** Owns document selection presentation and the active-document rename dialog. */
export default function DocumentMenu(props: DocumentMenuProps) {
    const [renameState, setRenameState] = React.useState<RenameState | null>(null);
    const activeDocument = props.documents.find(
        (document) => document.id === props.activeDocumentId
    );
    const activeDocumentLabel = activeDocument
        ? [
            activeDocument.title,
            props.documentLabels?.[activeDocument.id]
        ].filter(Boolean).join(" · ")
        : "Documents";
    const renameDocument = renameState
        ? props.documents.find((document) => document.id === renameState.documentId)
        : undefined;
    const closeRename = () => setRenameState(null);
    const items: MenuItem[] = [
        ...(activeDocument && props.renameDocument ? [{
            id: "rename",
            label: "Rename…",
            icon: createPoprightIcon("edit"),
            onSelect: () => setRenameState({
                documentId: activeDocument.id,
                title: activeDocument.title
            })
        }] : []),
        ...props.documents.map((document, index) => ({
            id: `document-${document.id}-${index}`,
            label: [
                document.title,
                `v${document.version}`,
                props.documentLabels?.[document.id]
            ].filter(Boolean).join(" · "),
            icon: createPoprightIcon(
                document.id === props.activeDocumentId ? "check" : "paper"
            ),
            onSelect: () => props.selectDocument?.(document.id)
        }))
    ];

    return (
        <>
            <Modal
                isOpen={Boolean(renameState && renameDocument && props.renameDocument)}
                title="Rename resume"
                close={closeRename}
                className="top-nav-modal rename-resume-modal"
            >
                {renameState && renameDocument && props.renameDocument ? (
                    <AsyncActionForm
                        aria-label="Rename current resume"
                        className="document-selector-rename-form"
                        save={async () => {
                            const result = await props.renameDocument?.(
                                renameDocument.id,
                                renameState.title
                            ) ?? null;
                            if (result === null) closeRename();
                            return result;
                        }}
                        cancel={closeRename}
                    >
                        <label className="rename-resume-field">
                            <span>Resume name</span>
                            <input
                                className="rename-resume-input"
                                {...nonCredentialInputAttributes}
                                maxLength={RESUME_TITLE_MAX_LENGTH}
                                value={renameState.title}
                                onChange={(event) => setRenameState({
                                    ...renameState,
                                    title: event.target.value
                                })}
                            />
                        </label>
                    </AsyncActionForm>
                ) : <></>}
            </Modal>
            <Dropdown
                className="toolbar-dropdown"
                wrapperClassName="document-selector"
                items={items}
                trigger={(
                    <Button
                        className="document-selector-trigger"
                        title={activeDocumentLabel}
                        aria-label={activeDocumentLabel}
                    >
                        <i className="icofont-paper" aria-hidden="true" />
                        <span className="document-selector-label top-nav-trigger-label">
                            {activeDocumentLabel}
                        </span>
                    </Button>
                )}
            />
        </>
    );
}
