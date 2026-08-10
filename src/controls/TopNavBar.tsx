import React from "react";

import "./TopNavBar.scss";

import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import Dropdown from "./menus/Dropdown";
import PureMenu, { PureMenuItem } from "./menus/PureMenu";
import { createPoprightIcon } from "./menus/poprightMenu";
import type { MenuItem } from "popright";
import Modal from "./Modal";
import GitHubLight from "@/assets/icons/GitHub-Mark-Light-120px-plus.png";
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
    signOut?: Action;
    signIn?: Action;
    fileMenuItems?: MenuItem[];
    documentItems?: React.ReactNode;
    extraItems?: React.ReactNode;

    /** Sidebar Actions */
    new: Action;
    toggleLanding: Action;
    toggleHelp: Action;
}

/** The top nav bar for the resume editor */
export function TopNavBar(props: TopNavBarProps) {
    let [isOpen, setOpen] = React.useState(false);
    const [isRenameOpen, setRenameOpen] = React.useState(false);
    const [renameTitle, setRenameTitle] = React.useState("");
    const Item = PureMenuItem;

    let [modalContent, setModal] = React.useState(<></>);
    let [title, setTitle] = React.useState("");

    let openLoader = () => {
        setOpen(true);
        setTitle("Load File");
        setModal(<FileLoader close={() => setOpen(false)} loadData={props.loadData} />);
    }

    let openSaver = () => {
        setOpen(true);
        setTitle("Save File");
        setModal(<FileSaver close={() => setOpen(false)} saveFile={props.saveFile} />);
    }

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
            onSelect: () => openLoader()
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
            onSelect: () => openSaver()
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
                setRenameOpen(true);
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

    React.useEffect(() => {
        setRenameTitle(activeDocument?.title ?? "");
    }, [activeDocument?.id, activeDocument?.title]);

    return (
        <>
            <Modal isOpen={isOpen} title={title} close={() => setOpen(false)} className="top-nav-modal">
                {modalContent}
            </Modal>
            <Modal
                isOpen={isRenameOpen}
                title="Rename resume"
                close={() => setRenameOpen(false)}
                className="top-nav-modal"
            >
                {activeDocument && props.renameDocument ? (
                    <AsyncActionForm
                        aria-label="Rename current resume"
                        className="document-selector-rename-form"
                        save={async () => {
                            const result = await props.renameDocument?.(activeDocument.id, renameTitle) ?? null;
                            if (result === null) {
                                setRenameOpen(false);
                            }
                            return result;
                        }}
                        cancel={() => setRenameOpen(false)}
                    >
                        <label>
                            <span>Resume name</span>
                            <input
                                {...nonCredentialInputAttributes}
                                maxLength={RESUME_TITLE_MAX_LENGTH}
                                value={renameTitle}
                                onChange={(event) => setRenameTitle(event.target.value)}
                            />
                        </label>
                    </AsyncActionForm>
                ) : <></>}
            </Modal>
            <div id="brand" className="app-px-1">
                <h1
                    aria-label="Go to landing page"
                    className="app-m-3"
                    onClick={props.toggleLanding}
                    onKeyDown={onBrandKeyDown}
                    role="button"
                    tabIndex={0}
                >
                    <img className="brand-mark" src={ExperiencerMark} alt="" aria-hidden="true" />
                    <span>Experiencer</span>
                </h1>
                {props.proBadge ? <span className="pro-badge">{props.proBadge}</span> : <></>}
                <PureMenu id="top-menu" horizontal divProps={{ className: "app-ml-4" }}>
                    <Dropdown
                        className="toolbar-dropdown"
                        items={fileMenuItems}
                        trigger={<Button>File</Button>}
                    />
                    <ThemeMenu />
                    {props.isEditing ? (
                        <Item onClick={props.toggleHelp}>
                            <Button>Help</Button>
                        </Item>
                    ) : <></>}
                    {props.extraItems}
                    {props.isEditing ? props.documentItems : <></>}
                    {props.isEditing && props.documents?.length ? (
                        <Dropdown
                            className="toolbar-dropdown"
                            wrapperClassName="document-selector"
                            items={documentMenuItems}
                            trigger={(
                                <Button
                                    className="document-selector-trigger"
                                    title={activeDocumentLabel}
                                >
                                    <span className="document-selector-label">
                                        {activeDocumentLabel}
                                    </span>
                                </Button>
                            )}
                        />
                    ) : <></>}
                </PureMenu>
                {props.isEditing && props.saveStatus
                    ? <span className="save-status">{props.saveStatus}</span>
                    : <></>}
                {props.accountLabel ? <span className="account-label">{props.accountLabel}</span> : <></>}
                {props.signOut ? <Button onClick={props.signOut}>Sign out</Button> : <></>}
                {props.signIn ? <Button onClick={props.signIn}>Login with Google for Pro access</Button> : <></>}
                <a href="https://github.com/vincentlaucsb/experiencer" aria-label="View Experiencer on GitHub">
                    <img className="github-mark" src={GitHubLight} alt="GitHub" />
                </a>
            </div>
        </>
    );
}

export type TopNavBarWrapperProps = Omit<
    TopNavBarProps,
    'loadData' | 'isEditing' |
    'saveLocal' | 'saveFile' | 'toggleHelp' | 'toggleLanding'
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
        toggleHelp: workspaceStore.toggleHelp,
        toggleLanding: () => workspaceStore.showLanding(),
        print: props.print ?? workspaceStore.startPrinting,
        saveLocal: props.saveLocal ?? saveLocal,
        saveFile
    };
    
    return <TopNavBar {...wrappedProps} />;
}
