import React from "react";

import "./TopNavBar.scss";

import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import Dropdown from "./menus/Dropdown";
import PureMenu, { PureMenuItem } from "./menus/PureMenu";
import Modal from "./Modal";
import GitHubLight from "@/assets/icons/GitHub-Mark-Light-120px-plus.png";
import { Action, EditorMode } from "@/types";
import { Button } from "./Buttons";
import ToolbarButton, { ToolbarButtonProps } from "./toolbar/ToolbarButton";
import { useEditorStore, useMode } from "@/shared/stores/editorStore";
import loadData from "@/shared/stores/loadData";
import { saveFile, saveLocal } from "@/shared/stores/saveResume";

export interface TopNavBarProps {
    isEditing: boolean;
    mode: EditorMode;

    /** Loading and Saving */
    exportHtml: Action;
    exportToPng: Action;
    loadData: (data: object) => void;
    saveFile: (filename: string) => void;
    saveLocal: Action;
    print: Action;

    /** Sidebar Actions */
    new: Action;
    toggleLanding: Action;
    toggleHelp: Action;
}

/** The top nav bar for the resume editor */
export function TopNavBar(props: TopNavBarProps) {
    let [isOpen, setOpen] = React.useState(false);
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
                    Experiencer
                </h1>
                <PureMenu id="top-menu" horizontal divProps={{ className: "app-ml-4" }}>
                    <Dropdown className="toolbar-dropdown" trigger={<Button>File</Button>}>
                        <IconicItem icon="paper" onClick={() => props.new()} text="New" />
                        <IconicItem icon="folder-open" onClick={openLoader} text="Load" />
                        <IconicItem disabled={!props.isEditing} onClick={props.saveLocal} text="Save" />
                        <IconicItem disabled={!props.isEditing} icon="save" onClick={openSaver} text="Save As" />
                        <IconicItem disabled={!props.isEditing} icon="file-html5" onClick={props.exportHtml} text="Export to HTML/CSS" />
                        <IconicItem disabled={!props.isEditing} icon="image" onClick={props.exportToPng} text="Export to PNG" />
                        <IconicItem disabled={!props.isEditing} icon="printer" onClick={props.print} text="Print" />
                    </Dropdown>
                    <Item onClick={props.toggleHelp}>
                        <Button>Help</Button>
                    </Item>
                </PureMenu>
                <a href="https://github.com/vincentlaucsb/experiencer" aria-label="View Experiencer on GitHub">
                    <img className="github-mark" src={GitHubLight} alt="GitHub" />
                </a>
            </div>
        </>
    );
}

export type TopNavBarWrapperProps = Omit<
    TopNavBarProps,
    'loadData' | 'mode' | 'isEditing' | 'print' |
    'saveLocal' | 'saveFile' | 'toggleHelp' | 'toggleLanding'
>;

export default function TopNavBarWrapper(props: TopNavBarWrapperProps) {
    const { toggleMode, mode, setMode } = useEditorStore();
    const isEditing = mode !== 'printing';

    const wrappedProps = {
        ...props,
        loadData: loadData,
        mode,
        isEditing,
        toggleHelp: () => toggleMode('help'),
        toggleLanding: () => setMode('landing'),
        print: () => toggleMode('printing'),
        saveLocal,
        saveFile
    };
    
    return <TopNavBar {...wrappedProps} />;
}