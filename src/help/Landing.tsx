import React from "react";
import PureMenu, { PureMenuItem } from "@/controls/menus/PureMenu";
import FileLoader from "@/controls/FileLoader";
import Modal from "@/controls/Modal";
import { Globals, Action } from "@/types";
import { Button } from "@/controls/Buttons";
import { ResumeDocumentSummary } from "@/shared/repositories/ResumeRepository";
import type { ResumeDocumentAction, ResumeDocumentGroup } from "@/app/Resume";

interface LandingProps {
    className?: string;
    loadLocal: () => void;
    loadData: (data: object, title?: string) => void;
    new: () => void;
    hasLocalResume?: boolean;
    documents?: ResumeDocumentSummary[];
    documentLabels?: Record<string, string>;
    documentGroups?: ResumeDocumentGroup[];
    documentActions?: Record<string, ResumeDocumentAction[]>;
    activeDocumentId?: string;
    openDocument?: (id: string) => void;
    deleteDocument?: (id: string) => void;
    renameDocument?: (id: string, title: string) => void;
}

function MenuItem (props: {
    children: React.ReactNode;
    icon: string;
    onClick: Action;
}) {
    return <PureMenuItem>
        <Button className="app-p-2" onClick={props.onClick}>
            <i className={`icofont-${props.icon} app-mr-4`} />
            {props.children}
        </Button>
    </PureMenuItem>
};

export default function Landing(props: LandingProps) {
    let [isOpen, setOpen] = React.useState(false);
    const [editingDocumentId, setEditingDocumentId] = React.useState<string | undefined>();
    const [editingTitle, setEditingTitle] = React.useState("");
    let modalContent = <FileLoader close={() => setOpen(false)} loadData={props.loadData} />

    const returnButton = (props.hasLocalResume ?? Boolean(localStorage.getItem(Globals.localStorageKey))) ?
        <MenuItem onClick={props.loadLocal} icon="hand-drawn-alt-left">
            Return to editing resume
        </MenuItem> : <></>
    const groups = props.documentGroups?.length
        ? props.documentGroups
        : [{
            id: "resumes",
            title: "Resumes",
            documentIds: props.documents?.map((document) => document.id) ?? []
        }];
    const documentsById = new Map(
        props.documents?.map((document) => [document.id, document]) ?? []
    );

    return (
        <>
            <Modal title="Load File" isOpen={isOpen} close={() => setOpen(false)} className="landing-modal">
                {modalContent}
            </Modal>
            <div id="landing" className="app-px-2">
                <h2>Getting Started</h2>
                <p>Welcome to Experiencer, a powerful tool that can help you create attractive resumes.</p>
                <p>Click on the <strong>New</strong> button in the top left to get started. Once you start
                    editing your resume, a <strong>Help</strong> button with more information will appear (also in the top left).</p>
                <PureMenu divProps={{ className: "landing-menu" }}>
                    {returnButton}
                    <MenuItem onClick={() => props.new()} icon="paper">New</MenuItem>
                    <MenuItem onClick={() => setOpen(true)} icon="folder-open">Load</MenuItem>
                </PureMenu>
                {props.documents?.length ? (
                    <section className="resume-library" aria-label="Resume library">
                        {groups.map((group) => {
                            const documents = group.documentIds
                                .map((id) => documentsById.get(id))
                                .filter((document): document is ResumeDocumentSummary => Boolean(document));
                            if (!documents.length) {
                                return null;
                            }

                            return (
                            <div className="resume-library-group" key={group.id}>
                                <h2>{group.title}</h2>
                                <div className="resume-library-list">
                            {documents.map((document) => (
                                <article
                                    className={document.id === props.activeDocumentId ? "resume-library-item active" : "resume-library-item"}
                                    key={document.id}
                                >
                                    {editingDocumentId === document.id ? (
                                        <form
                                            className="resume-library-edit"
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                props.renameDocument?.(document.id, editingTitle);
                                                setEditingDocumentId(undefined);
                                            }}
                                        >
                                            <label>
                                                <span>Name</span>
                                                <input
                                                    autoFocus
                                                    value={editingTitle}
                                                    onChange={(event) => setEditingTitle(event.target.value)}
                                                />
                                            </label>
                                            <div className="resume-library-actions">
                                                <Button type="submit">Save</Button>
                                                <Button type="button" onClick={() => setEditingDocumentId(undefined)}>Cancel</Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div>
                                            <h3>
                                                {document.title}
                                                {props.documentLabels?.[document.id]
                                                    ? (
                                                        <span className="document-label">
                                                            {props.documentLabels[document.id]}
                                                        </span>
                                                    )
                                                    : <></>}
                                            </h3>
                                            <p>Version {document.version} · Updated {new Date(document.updatedAt).toLocaleString()}</p>
                                        </div>
                                    )}
                                    <div className="resume-library-actions">
                                        <Button onClick={() => props.openDocument?.(document.id)}>Open</Button>
                                        <Button onClick={() => {
                                            setEditingDocumentId(document.id);
                                            setEditingTitle(document.title);
                                        }}>Rename</Button>
                                        <Button onClick={() => props.deleteDocument?.(document.id)}>Delete</Button>
                                        {props.documentActions?.[document.id]?.map((action) => (
                                            <Button
                                                disabled={action.disabled}
                                                key={action.id}
                                                onClick={() => void action.run()}
                                            >
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>
                                </article>
                            ))}
                                </div>
                            </div>
                            );
                        })}
                    </section>
                ) : <></>}
            </div>
        </>
    );
}
