import React from "react";
import { DropdownMenu, type MenuItem as DropdownMenuItem } from "@/controls/menus/poprightMenu";
import { Button } from "@/controls/Buttons";
import { ResumeDocumentSummary } from "@/shared/repositories/ResumeRepository";
import type { ResumeDocumentAction } from "@/app/ResumeAppContracts";
import AsyncActionForm from "@/controls/AsyncActionForm";
import { RESUME_TITLE_MAX_LENGTH } from "@/shared/repositories/ResumeRepository";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";
import { browserDateTimeFormatter } from "@/shared/utils/dateTimeFormat";
import { useResumeDocumentStatus } from '@/shared/hooks/useResumeDocumentStatus';
import type { ResumeDocumentStatusSource } from '@/shared/stores/ResumeDocumentStatusSource';

interface ResumeLibraryRowProps {
    document: ResumeDocumentSummary;
    activeDocumentId?: string;
    label?: string;
    metadata?: string;
    actions?: ResumeDocumentAction[];
    statusSource?: ResumeDocumentStatusSource;
    openDocument?: (id: string) => void;
    deleteDocument?: (id: string) => void;
    renameDocument?: (id: string, title: string) => Promise<string | null>;
}

function DocumentActionsMenu(props: {
    disabled?: boolean;
    document: ResumeDocumentSummary;
    actions?: ResumeDocumentAction[];
    onRename?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const menuId = `document-actions-${React.useId().replace(/:/g, "")}`;
    const items: DropdownMenuItem[] = [
        ...(props.onRename ? [{
            id: `rename-${props.document.id}`,
            label: "Rename",
            disabled: props.disabled,
            onSelect: props.onRename
        }] : []),
        ...(props.actions ?? []).map((action) => ({
            id: `${action.id}-${props.document.id}`,
            label: action.label,
            disabled: props.disabled || action.disabled,
            onSelect: () => void action.run()
        }))
    ];

    if (!items.length) return null;

    return (
        <DropdownMenu
            className="resume-library-actions-menu"
            id={menuId}
            items={items}
            side="bottom"
            align="end"
            minWidth={190}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
        >
            <Button
                disabled={props.disabled}
                aria-label={`More Actions for ${props.document.title}`}
                aria-controls={menuId}
                aria-expanded={open}
                aria-haspopup="menu"
            >
                <span aria-hidden="true">⋯</span>
                <span>More Actions</span>
            </Button>
        </DropdownMenu>
    );
}

/** Renders one library document and subscribes directly to its injected operation status. */
export default function ResumeLibraryRow(props: ResumeLibraryRowProps) {
    const { document } = props;
    const status = useResumeDocumentStatus(document.id, props.statusSource);
    const [editing, setEditing] = React.useState(false);
    const [editingTitle, setEditingTitle] = React.useState("");
    return (
        <article
            className={["resume-library-item", document.id === props.activeDocumentId && "active", status.busy && "busy"].filter(Boolean).join(" ")}
            aria-busy={status.busy || undefined}
        >
            {editing ? (
                <fieldset disabled={status.busy} className="resume-library-edit-fieldset">
                    <AsyncActionForm
                    className="resume-library-edit"
                    save={async () => {
                        const error = await props.renameDocument?.(
                            document.id,
                            editingTitle
                        ) ?? null;
                        if (!error) {
                            setEditing(false);
                        }
                        return error;
                    }}
                    cancel={() => setEditing(false)}
                >
                    <label>
                        <span>Name</span>
                        <input
                            {...nonCredentialInputAttributes}
                            disabled={status.busy}
                            autoFocus
                            maxLength={RESUME_TITLE_MAX_LENGTH}
                            value={editingTitle}
                            onChange={(event) => setEditingTitle(event.target.value)}
                        />
                    </label>
                </AsyncActionForm>
                </fieldset>
            ) : (
                <div className="resume-library-details">
                    <h3 className="resume-library-title">
                        <span
                            className="resume-library-title-text"
                            title={document.title}
                        >
                            {document.title}
                        </span>
                        {props.label
                            ? (
                                <span className="document-label">
                                    {props.label}
                                </span>
                            )
                            : <></>}
                    </h3>
                    <p>Version {document.version} · Updated {browserDateTimeFormatter.formatDateTime(document.updatedAt)}</p>
                    {props.metadata
                        ? <p className="resume-library-metadata">{props.metadata}</p>
                        : <></>}
                </div>
            )}
            <div className="resume-library-actions">
                {status.busy && (
                    <span className="resume-library-status" role="status">
                        <span className="resume-library-spinner" aria-hidden="true" />
                        {status.message}
                    </span>
                )}
                <Button
                    disabled={status.busy}
                    variant="primary"
                    onClick={() => props.openDocument?.(document.id)}
                >
                    Open
                </Button>
                <DocumentActionsMenu
                    disabled={status.busy}
                    document={document}
                    actions={props.actions}
                    onRename={props.renameDocument ? () => {
                        setEditing(true);
                        setEditingTitle(document.title);
                    } : undefined}
                />
                <Button
                    disabled={status.busy}
                    appearance="outline"
                    variant="error"
                    onClick={() => props.deleteDocument?.(document.id)}
                >
                    Delete
                </Button>
            </div>
        </article>
    );
}
