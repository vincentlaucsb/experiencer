import React from "react";
import PureMenu, { PureMenuItem } from "@/controls/menus/PureMenu";
import FileLoader from "@/controls/FileLoader";
import Modal from "@/controls/Modal";
import { Globals, Action } from "@/types";
import { Button } from "@/controls/Buttons";
import { ResumeDocumentSummary } from "@/shared/repositories/ResumeRepository";
import type { ResumeDocumentAction, ResumeDocumentGroup } from "@/app/ResumeAppContracts";
import AsyncActionForm from "@/controls/AsyncActionForm";
import { RESUME_TITLE_MAX_LENGTH } from "@/shared/repositories/ResumeRepository";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";
import { browserDateTimeFormatter } from "@/shared/utils/dateTimeFormat";
import GitHubLight from "@/assets/icons/GitHub-Mark-Light-120px-plus.png";
import SocialLinks from "./SocialLinks";

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
    renameDocument?: (id: string, title: string) => Promise<string | null>;
    renderLead?: (actions: LandingActions, context: LandingContext) => React.ReactNode;
    showSocialLinks?: boolean;
}

export interface LandingActions {
    createResume: () => void;
    loadResume: () => void;
    returnToResume?: () => void;
}

export interface LandingContext {
    documentCount: number;
    hasResumableSession: boolean;
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

    const hasResumableSession = props.hasLocalResume ?? Boolean(localStorage.getItem(Globals.localStorageKey));
    const returnButton = hasResumableSession ?
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
    const lead = props.renderLead?.({
        createResume: props.new,
        loadResume: () => setOpen(true),
        returnToResume: hasResumableSession ? props.loadLocal : undefined
    }, {
        documentCount: props.documents?.length ?? 0,
        hasResumableSession
    });

    return (
        <>
            <Modal title="Load File" isOpen={isOpen} close={() => setOpen(false)} className="landing-modal file-loader-modal">
                {modalContent}
            </Modal>
            <div id="landing" className={['app-px-2', props.className].filter(Boolean).join(' ')}>
                {lead ?? <>
                    <h2>Getting Started</h2>
                    <p>Welcome to Experiencer, a powerful tool that can help you create attractive resumes.</p>
                    <p>Click on the <strong>New</strong> button in the top left to get started. Once you start
                        editing your resume, a <strong>Help</strong> button with more information will appear (also in the top left).</p>
                    <PureMenu divProps={{ className: "landing-menu" }}>
                        {returnButton}
                        <MenuItem onClick={() => props.new()} icon="paper">New</MenuItem>
                        <MenuItem onClick={() => setOpen(true)} icon="folder-open">Load</MenuItem>
                    </PureMenu>
                </>}
                {props.documents?.length || groups.some((group) => group.showWhenEmpty) ? (
                    <section className="resume-library" aria-label="Resume library">
                        {groups.map((group) => {
                            const documents = group.documentIds
                                .map((id) => documentsById.get(id))
                                .filter((document): document is ResumeDocumentSummary => Boolean(document));
                            if (!documents.length && !group.showWhenEmpty) {
                                return null;
                            }

                            return (
                            <div className="resume-library-group" key={group.id}>
                                <div className="resume-library-group-heading">
                                    <h2>{group.title}</h2>
                                    {group.summary
                                        ? <span className="resume-library-group-summary">{group.summary}</span>
                                        : <></>}
                                </div>
                                {documents.length ? <div className="resume-library-list">
                            {documents.map((document) => (
                                <article
                                    className={document.id === props.activeDocumentId ? "resume-library-item active" : "resume-library-item"}
                                    key={document.id}
                                >
                                    {editingDocumentId === document.id ? (
                                        <AsyncActionForm
                                            className="resume-library-edit"
                                            save={async () => {
                                                const error = await props.renameDocument?.(
                                                    document.id,
                                                    editingTitle
                                                ) ?? null;
                                                if (!error) {
                                                    setEditingDocumentId(undefined);
                                                }
                                                return error;
                                            }}
                                            cancel={() => setEditingDocumentId(undefined)}
                                        >
                                            <label>
                                                <span>Name</span>
                                                <input
                                                    {...nonCredentialInputAttributes}
                                                    autoFocus
                                                    maxLength={RESUME_TITLE_MAX_LENGTH}
                                                    value={editingTitle}
                                                    onChange={(event) => setEditingTitle(event.target.value)}
                                                />
                                            </label>
                                        </AsyncActionForm>
                                    ) : (
                                        <div className="resume-library-details">
                                            <h3 className="resume-library-title">
                                                <span
                                                    className="resume-library-title-text"
                                                    title={document.title}
                                                >
                                                    {document.title}
                                                </span>
                                                {props.documentLabels?.[document.id]
                                                    ? (
                                                        <span className="document-label">
                                                            {props.documentLabels[document.id]}
                                                        </span>
                                                    )
                                                    : <></>}
                                            </h3>
                                            <p>Version {document.version} · Updated {browserDateTimeFormatter.formatDateTime(document.updatedAt)}</p>
                                        </div>
                                    )}
                                    <div className="resume-library-actions">
                                        <Button
                                            variant="primary"
                                            onClick={() => props.openDocument?.(document.id)}
                                        >
                                            Open
                                        </Button>
                                        <Button onClick={() => {
                                            setEditingDocumentId(document.id);
                                            setEditingTitle(document.title);
                                        }}>Rename</Button>
                                        {props.documentActions?.[document.id]?.map((action) => (
                                            <Button
                                                disabled={action.disabled}
                                                key={action.id}
                                                onClick={() => void action.run()}
                                            >
                                                {action.label}
                                            </Button>
                                        ))}
                                        <Button
                                            appearance="outline"
                                            variant="error"
                                            onClick={() => props.deleteDocument?.(document.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </article>
                            ))}
                                </div> : <></>}
                            </div>
                            );
                        })}
                    </section>
                ) : <></>}
                {props.showSocialLinks === false ? <></> : <SocialLinks links={[{
                    href: "https://github.com/vincentlaucsb/experiencer",
                    label: "View Experiencer on GitHub",
                    imageSrc: GitHubLight,
                    imageAlt: "GitHub"
                }]} />}
            </div>
        </>
    );
}
