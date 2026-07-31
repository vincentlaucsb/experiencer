import React from "react";

import "./TopNavBar.scss";

import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import Dropdown from "./menus/Dropdown";
import PureMenu, { PureMenuItem } from "./menus/PureMenu";
import Modal from "./Modal";
import GitHubLight from "@/assets/icons/GitHub-Mark-Light-120px-plus.png";
import ExperiencerMark from "@/assets/brand/experiencer-mark-on-dark.svg?url";
import { Action } from "@/types";
import { Button } from "./Buttons";
import ToolbarButton, { ToolbarButtonProps } from "./toolbar/ToolbarButton";
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
    fileMenuItems?: React.ReactNode;
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
    const [renameTitle, setRenameTitle] = React.useState("");
    const Item = PureMenuItem;
    const IconicItem = (props: ToolbarButtonProps) => (
        <PureMenuItem>
            <ToolbarButton {...props} dropdownChild={true} />
        </PureMenuItem>
    );

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

    React.useEffect(() => {
        setRenameTitle(activeDocument?.title ?? "");
    }, [activeDocument?.id, activeDocument?.title]);

    return (
        <>
            <Modal isOpen={isOpen} title={title} close={() => setOpen(false)} className="top-nav-modal">
                {modalContent}
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
                    <Dropdown className="toolbar-dropdown" trigger={<Button>File</Button>}>
                        <IconicItem icon="paper" onClick={() => props.new()} text="New" />
                        <IconicItem icon="folder-open" onClick={openLoader} text="Load" />
                        <IconicItem disabled={!props.isEditing} onClick={props.saveLocal} text="Save" />
                        {props.fileMenuItems}
                        <IconicItem disabled={!props.isEditing} icon="save" onClick={openSaver} text="Save As" />
                        <IconicItem disabled={!props.isEditing} icon="file-html5" onClick={props.exportHtml} text="Export to HTML/CSS" />
                        <IconicItem disabled={!props.isEditing} icon="image" onClick={props.exportToPng} text="Export to PNG" />
                        <IconicItem disabled={!props.isEditing} icon="printer" onClick={props.print} text="Print" />
                    </Dropdown>
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
                            className="toolbar-dropdown document-selector"
                            trigger={(
                                <Button
                                    className="document-selector-trigger"
                                    onClick={() => setRenameTitle(activeDocument?.title ?? "")}
                                    title={activeDocumentLabel}
                                >
                                    <span className="document-selector-label">
                                        {activeDocumentLabel}
                                    </span>
                                </Button>
                            )}
                        >
                            {activeDocument && props.renameDocument ? (
                                <PureMenuItem className="document-selector-rename">
                                    <AsyncActionForm
                                        aria-label="Rename current resume"
                                        className="document-selector-rename-form"
                                        onClick={(event) => event.stopPropagation()}
                                        save={() => props.renameDocument?.(
                                            activeDocument.id,
                                            renameTitle
                                        ) ?? Promise.resolve(null)}
                                        cancel={() => setRenameTitle(activeDocument.title)}
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
                                </PureMenuItem>
                            ) : <></>}
                            {props.documents.map((document) => (
                                <IconicItem
                                    key={document.id}
                                    icon={document.id === props.activeDocumentId ? "check" : "paper"}
                                    onClick={() => props.selectDocument?.(document.id)}
                                    text={[
                                        document.title,
                                        `v${document.version}`,
                                        props.documentLabels?.[document.id]
                                    ].filter(Boolean).join(" · ")}
                                />
                            ))}
                        </Dropdown>
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
    'loadData' | 'isEditing' | 'print' |
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
        print: workspaceStore.startPrinting,
        saveLocal: props.saveLocal ?? saveLocal,
        saveFile
    };
    
    return <TopNavBar {...wrappedProps} />;
}
