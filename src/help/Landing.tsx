import React from "react";
import PureMenu, { PureMenuItem } from "@/controls/menus/PureMenu";
import FileLoader from "@/controls/FileLoader";
import Modal from "@/controls/Modal";
import { Globals, Action } from "@/types";
import { Button } from "@/controls/Buttons";
import { ResumeDocumentSummary } from "@/shared/repositories/ResumeRepository";

interface LandingProps {
    className?: string;
    loadLocal: () => void;
    loadData: (data: object, title?: string) => void;
    new: () => void;
    hasLocalResume?: boolean;
    documents?: ResumeDocumentSummary[];
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
                        <h2>Resumes</h2>
                        <div className="resume-library-list">
                            {props.documents.map((document) => (
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
                                            <h3>{document.title}</h3>
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
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : <></>}
            </div>
        </>
    );
}
