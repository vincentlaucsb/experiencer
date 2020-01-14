import React from "react";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import PureMenu, { PureMenuItem, PureMenuLink, PureDropdown } from "./menus/PureMenu";
import IconicMenuItem from "./menus/MenuItem";
import Modal from "./Modal";
import GitHubLight from "../../icons/GitHub-Mark-Light-120px-plus.png";
import { Action, EditorMode } from "../utility/Types";
import { Button } from "./Buttons";

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
                    <PureDropdown trigger={<Button>File</Button>}>
                        <IconicMenuItem icon="paper" onClick={() => props.new()} text="New" />
                        <IconicMenuItem icon="folder-open" onClick={openLoader} text="Load" />
                        <IconicMenuItem disabled={!props.isEditing} onClick={props.saveLocal} text="Save" />
                        <IconicMenuItem disabled={!props.isEditing} icon="save" onClick={openSaver} text="Save As" />
                        <IconicMenuItem disabled={!props.isEditing} icon="file-html5" onClick={props.exportHtml} text="Export to HTML/CSS" />
                        <IconicMenuItem disabled={!props.isEditing} icon="printer" onClick={props.print} text="Print" />
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