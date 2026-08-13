import React from "react";

import "./TopNavBar.scss";

import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import Dropdown from "./menus/Dropdown";
import PureMenu from "./menus/PureMenu";
import { createPoprightIcon } from "./menus/poprightMenu";
import type { MenuItem } from "popright";
import Modal from "./Modal";
import ExperiencerMark from "@/assets/brand/experiencer-mark-on-dark.svg?url";
import { Action } from "@/types";
import { Button } from "./Buttons";
import { isEditingMode, workspaceStore } from "@/shared/stores/workspaceStore";
import { useWorkspaceSnapshot } from "@/shared/stores/workspaceStoreHooks";
import loadData from "@/shared/stores/loadData";
import { saveFile, saveLocal } from "@/shared/stores/saveResume";
import {
    RESUME_TITLE_MAX_LENGTH,
    ResumeDocumentSummary
} from "@/shared/repositories/ResumeRepository";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";
import AsyncActionForm from "./AsyncActionForm";
import ThemeMenu from "./ThemeMenu";
import KeyboardShortcutsModal from "@/help/KeyboardShortcutsModal";
import useHorizontalOverflow from "@/shared/hooks/useHorizontalOverflow";

export interface TopNavBarProps {
    isEditing: boolean;

    /** Loading and Saving */
    exportHtml: Action;
    exportToPng: Action;
    loadData: (data: object, title?: string) => void;
    saveFile: (filename: string) => void;
    saveLocal: Action;
    print: Action;
    documents?: ResumeDocumentSummary[];
    documentLabels?: Record<string, string>;
    activeDocumentId?: string;
    selectDocument?: (id: string) => void;
    renameDocument?: (id: string, title: string) => Promise<string | null>;
    saveStatus?: string;
    proBadge?: string;
    accountLabel?: string;
    editingStorage?: "local" | "cloud";
    signOut?: Action;
    signIn?: Action;
    fileMenuItems?: MenuItem[];
    documentItems?: React.ReactNode;
    helpMenuItems?: MenuItem[];
    secondaryItems?: React.ReactNode;

    /** Sidebar Actions */
    new: Action;
    toggleLanding: Action;
}

type ActiveTopNavModal =
    | { kind: "load" }
    | { kind: "save" }
    | { kind: "rename"; documentId: string }
    | null;

/** The top nav bar for the resume editor */
export function TopNavBar(props: TopNavBarProps) {
    const [activeModal, setActiveModal] = React.useState<ActiveTopNavModal>(null);
    const [isShortcutsOpen, setShortcutsOpen] = React.useState(false);
    const [renameTitle, setRenameTitle] = React.useState("");
    const helpTriggerRef = React.useRef<HTMLButtonElement>(null);
    const brandRef = React.useRef<HTMLDivElement>(null);
    const lastMeasuredWidthRef = React.useRef<number | undefined>(undefined);
    const [navDensity, setNavDensity] = React.useState(0);
    const overflowMeasurement = useHorizontalOverflow(brandRef);

    React.useEffect(() => {
        if (overflowMeasurement.clientWidth <= 0) return;

        const hasWidthChanged = lastMeasuredWidthRef.current !== undefined
            && lastMeasuredWidthRef.current !== overflowMeasurement.clientWidth;
        lastMeasuredWidthRef.current = overflowMeasurement.clientWidth;

        setNavDensity((density) => {
            if (overflowMeasurement.isOverflowing && density < 4) {
                return density + 1;
            }
            // Expansion is only attempted after a real width change. This prevents
            // hiding and immediately restoring the same item in a layout feedback loop.
            if (!overflowMeasurement.isOverflowing && hasWidthChanged && density > 0) {
                return density - 1;
            }
            return density;
        });
    }, [
        overflowMeasurement.clientWidth,
        overflowMeasurement.isOverflowing,
        overflowMeasurement.scrollWidth
    ]);

    const closeActiveModal = () => setActiveModal(null);

    const onBrandKeyDown = (event: React.KeyboardEvent<HTMLHeadingElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            props.toggleLanding();
        }
    };
    const activeDocument = props.documents?.find(
        (document) => document.id === props.activeDocumentId
    );
    const activeDocumentLabel = activeDocument
        ? [
            activeDocument.title,
            props.documentLabels?.[activeDocument.id]
        ].filter(Boolean).join(" · ")
        : "Documents";

    const fileMenuItems: MenuItem[] = [
        {
            id: "new",
            label: "New",
            icon: createPoprightIcon("paper"),
            onSelect: () => props.new()
        },
        {
            id: "load",
            label: "Load",
            icon: createPoprightIcon("folder-open"),
            onSelect: () => setActiveModal({ kind: "load" })
        },
        {
            id: "save",
            label: "Save",
            disabled: !props.isEditing,
            onSelect: () => props.saveLocal()
        },
        ...(props.fileMenuItems || []),
        {
            id: "save-as",
            label: "Save As",
            icon: createPoprightIcon("save"),
            disabled: !props.isEditing,
            onSelect: () => setActiveModal({ kind: "save" })
        },
        {
            id: "export-html",
            label: "Export HTML/CSS package",
            icon: createPoprightIcon("file-html5"),
            disabled: !props.isEditing,
            onSelect: () => props.exportHtml()
        },
        {
            id: "export-png",
            label: "Export to PNG",
            icon: createPoprightIcon("image"),
            disabled: !props.isEditing,
            onSelect: () => props.exportToPng()
        },
        {
            id: "print",
            label: "Print",
            icon: createPoprightIcon("printer"),
            disabled: !props.isEditing,
            onSelect: () => props.print()
        }
    ];

    const documentMenuItems: MenuItem[] = [
        ...(activeDocument && props.renameDocument ? [{
            id: "rename",
            label: "Rename…",
            icon: createPoprightIcon("edit"),
            onSelect: () => {
                setRenameTitle(activeDocument.title);
                setActiveModal({
                    kind: "rename",
                    documentId: activeDocument.id
                });
            }
        }] : []),
        ...(props.documents || []).map((document, index) => ({
            id: `document-${document.id}-${index}`,
            label: [
                document.title,
                `v${document.version}`,
                props.documentLabels?.[document.id]
            ].filter(Boolean).join(" · "),
            icon: createPoprightIcon(document.id === props.activeDocumentId ? "check" : "paper"),
            onSelect: () => props.selectDocument?.(document.id)
        }))
    ];
    const helpMenuItems: MenuItem[] = [
        {
            id: "documentation",
            label: "Documentation (opens in a new tab)",
            icon: createPoprightIcon("book-alt"),
            onSelect: () => {
                const documentationWindow = window.open(
                    "/docs/",
                    "_blank",
                    "noopener,noreferrer"
                );
                if (documentationWindow) {
                    documentationWindow.opener = null;
                }
            }
        },
        {
            id: "keyboard-shortcuts",
            label: "Keyboard shortcuts",
            icon: createPoprightIcon("keyboard"),
            onSelect: () => setShortcutsOpen(true)
        },
        ...(props.helpMenuItems?.length
            ? [{ type: "separator" } as MenuItem, ...props.helpMenuItems]
            : [])
    ];

    const closeShortcuts = () => {
        setShortcutsOpen(false);
        window.requestAnimationFrame(() => helpTriggerRef.current?.focus());
    };

    const renameDocument = activeModal?.kind === "rename"
        ? props.documents?.find((document) => document.id === activeModal.documentId)
        : undefined;
    const modalTitle = activeModal?.kind === "load"
        ? "Load File"
        : activeModal?.kind === "save"
            ? "Save File"
            : activeModal?.kind === "rename"
                ? "Rename resume"
                : "";
    const modalClassName = activeModal?.kind === "load"
        ? "top-nav-modal file-loader-modal"
        : activeModal?.kind === "rename"
            ? "top-nav-modal rename-resume-modal"
            : "top-nav-modal";

    let modalContent: React.ReactElement = <></>;
    if (activeModal?.kind === "load") {
        modalContent = (
            <FileLoader close={closeActiveModal} loadData={props.loadData} />
        );
    } else if (activeModal?.kind === "save") {
        modalContent = (
            <FileSaver close={closeActiveModal} saveFile={props.saveFile} />
        );
    } else if (activeModal?.kind === "rename" && renameDocument && props.renameDocument) {
        modalContent = (
            <AsyncActionForm
                aria-label="Rename current resume"
                className="document-selector-rename-form"
                save={async () => {
                    const result = await props.renameDocument?.(
                        renameDocument.id,
                        renameTitle
                    ) ?? null;
                    if (result === null) {
                        closeActiveModal();
                    }
                    return result;
                }}
                cancel={closeActiveModal}
            >
                <label className="rename-resume-field">
                    <span>Resume name</span>
                    <input
                        className="rename-resume-input"
                        {...nonCredentialInputAttributes}
                        maxLength={RESUME_TITLE_MAX_LENGTH}
                        value={renameTitle}
                        onChange={(event) => setRenameTitle(event.target.value)}
                    />
                </label>
            </AsyncActionForm>
        );
    }

    return (
        <>
            <KeyboardShortcutsModal isOpen={isShortcutsOpen} close={closeShortcuts} />
            <Modal
                isOpen={activeModal !== null}
                title={modalTitle}
                close={closeActiveModal}
                className={modalClassName}
            >
                {modalContent}
            </Modal>
            <div
                id="brand"
                ref={brandRef}
                data-nav-density={navDensity}
                className={`app-px-1 ${props.isEditing ? 'is-editing' : 'is-landing'}`}
            >
                <div className="brand-primary">
                    <h1
                        aria-label="Go to landing page"
                        className="app-m-3"
                        onClick={props.toggleLanding}
                        onKeyDown={onBrandKeyDown}
                        role="button"
                        tabIndex={0}
                    >
                        <img className="brand-mark" src={ExperiencerMark} alt="" aria-hidden="true" />
                        <span className="brand-wordmark">Experiencer</span>
                    </h1>
                    {props.proBadge ? <span className="pro-badge">{props.proBadge}</span> : <></>}
                    <PureMenu id="top-menu" horizontal divProps={{ className: "app-ml-4" }}>
                        {props.isEditing ? (
                            <>
                            <Dropdown
                                className="toolbar-dropdown"
                                items={fileMenuItems}
                                trigger={(
                                    <Button aria-label="File">
                                        <i className="icofont-file" aria-hidden="true" />
                                        <span className="top-nav-trigger-label">File</span>
                                    </Button>
                                )}
                            />
                            <ThemeMenu compact={navDensity >= 3} />
                            </>
                        ) : <></>}
                        <Dropdown
                            className="toolbar-dropdown"
                            items={helpMenuItems}
                            trigger={(
                                <Button ref={helpTriggerRef} aria-label="Help">
                                    <i className="icofont-question-circle" aria-hidden="true" />
                                    <span className="top-nav-trigger-label">Help</span>
                                </Button>
                            )}
                        />
                        {props.isEditing ? (
                            <>
                            {props.documentItems}
                            {props.documents?.length ? (
                                <Dropdown
                                    className="toolbar-dropdown"
                                    wrapperClassName="document-selector"
                                    items={documentMenuItems}
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
                            ) : <></>}
                            </>
                        ) : <></>}
                    </PureMenu>
                </div>
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
            </div>
        </>
    );
}

export type TopNavBarWrapperProps = Omit<
    TopNavBarProps,
    'loadData' | 'isEditing' |
    'saveLocal' | 'saveFile' | 'toggleLanding'
> & {
    loadData?: (data: object, title?: string) => void;
    saveLocal?: Action;
    isEditing?: boolean;
};

export default function TopNavBarWrapper(props: TopNavBarWrapperProps) {
    const workspace = useWorkspaceSnapshot();
    const isEditing = props.isEditing ?? isEditingMode(workspace.mode);
    const loadImportedData = (data: object) => loadData(data);

    const wrappedProps = {
        ...props,
        loadData: props.loadData ?? loadImportedData,
        isEditing,
        toggleLanding: () => workspaceStore.showLanding(),
        print: props.print,
        saveLocal: props.saveLocal ?? saveLocal,
        saveFile
    };
    
    return <TopNavBar {...wrappedProps} />;
}
