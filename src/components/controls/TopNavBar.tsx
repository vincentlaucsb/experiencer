import React from "react";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import PureMenu, { PureMenuItem, PureDropdown } from "./menus/PureMenu";
import Modal from "./Modal";
import GitHubLight from "../../icons/GitHub-Mark-Light-120px-plus.png";
import { Action, EditorMode } from "../utility/Types";
import { Button } from "./Buttons";
import ToolbarButton, { ToolbarButtonProps } from "./toolbar/ToolbarButton";

export interface TopNavBarProps {
    isEditing: boolean;
    mode: EditorMode;

    /** Loading and Saving */
    exportHtml: Action;
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
export default function TopNavBar(props: TopNavBarProps) {
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

    return (
        <>
            <Modal isOpen={isOpen} title={title} close={() => setOpen(false)} className="top-nav-modal">
                {modalContent}
            </Modal>
            <div id="brand">
                <h1 onClick={props.toggleLanding}>Experiencer</h1>
                <PureMenu id="top-menu" horizontal>
                    <PureDropdown className="toolbar-dropdown" trigger={<Button>File</Button>}>
                        <IconicItem icon="paper" action={() => props.new()} text="New" />
                        <IconicItem icon="folder-open" action={openLoader} text="Load" />
                        <IconicItem disabled={!props.isEditing} action={props.saveLocal} text="Save" />
                        <IconicItem disabled={!props.isEditing} icon="save" action={openSaver} text="Save As" />
                        <IconicItem disabled={!props.isEditing} icon="file-html5" action={props.exportHtml} text="Export to HTML/CSS" />
                        <IconicItem disabled={!props.isEditing} icon="printer" action={props.print} text="Print" />
                    </PureDropdown>
                    <Item onClick={props.toggleHelp}>
                        <Button>Help</Button>
                    </Item>
                </PureMenu>
                <a href="https://github.com/vincentlaucsb/experiencer">
                    <img className="github-mark" src={GitHubLight} alt="GitHub" />
                </a>
            </div>
        </>
    );
}