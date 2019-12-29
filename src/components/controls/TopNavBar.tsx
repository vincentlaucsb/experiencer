import { Action } from "../ResumeNodeBase";
import React from "react";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import { EditorMode } from "../ResumeComponent";
import PureMenu, { PureMenuItem, PureMenuLink, PureDropdown } from "./menus/PureMenu";
import IconicMenuItem from "./menus/MenuItem";
import Modal from "./Modal";
import GitHubLight from "../../icons/GitHub-Mark-Light-120px-plus.png";

interface TopNavBarProps {
    isEditing: boolean;
    mode: EditorMode;

    /** Loading and Saving */
    exportHtml: Action;
    loadData: (data: object) => void;
    saveFile: (filename: string) => void;
    saveLocal: Action;
    print: Action;

    /** Sidebar Actions */
    changeTemplate: Action;
    toggleLanding: Action;
    toggleHelp: Action;
}

/** The top nav bar for the resume editor */
export default function TopNavBar(props: TopNavBarProps) {
    let [isOpen, setOpen] = React.useState(false);
    const Item = PureMenuItem;
    const Link = PureMenuLink;

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
                    <PureDropdown content={<Link>File</Link>}
                        ulProps={{className: "icon-menu"}}>
                        <IconicMenuItem icon="paper" onClick={props.changeTemplate} label="New" />
                        <IconicMenuItem icon="folder-open" onClick={openLoader} label="Load" />
                        <IconicMenuItem disabled={!props.isEditing} onClick={props.saveLocal} label="Save" />
                        <IconicMenuItem disabled={!props.isEditing} icon="save" onClick={openSaver} label="Save As" />
                        <IconicMenuItem disabled={!props.isEditing} icon="file-html5" onClick={props.exportHtml} label="Export to HTML/CSS" />
                        <IconicMenuItem disabled={!props.isEditing} icon="printer" onClick={props.print} label="Print" />
                    </PureDropdown>
                    <Item onClick={props.toggleHelp}>
                        <Link>Help</Link>
                    </Item>
                </PureMenu>
                <div>
                    <a href="https://github.com/vincentlaucsb/experiencer">
                        <img className="github-mark" src={GitHubLight} alt="GitHub" />
                    </a>
                </div>
                </div>
            </>
    );
}