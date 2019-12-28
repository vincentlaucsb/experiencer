import { Action } from "../ResumeNodeBase";
import React from "react";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import { EditorMode } from "../ResumeComponent";
import PureMenu, { PureMenuItem, PureMenuLink, PureDropdown } from "./menus/PureMenu";
import Octicon, { MarkGithub } from "@primer/octicons-react";
import ReactModal from "react-modal";
import IconicMenuItem from "./menus/MenuItem";

interface TopNavBarProps {
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

    let openLoader = () => {
        setOpen(true);
        setModal(<FileLoader close={() => setOpen(false)} loadData={props.loadData} />);
    }

    let openSaver = () => {
        setOpen(true);
        setModal(<FileSaver close={() => setOpen(false)} saveFile={props.saveFile} />);
    }

    return (
        <>
            <ReactModal isOpen={isOpen} className="top-nav-modal">
                {modalContent}
            </ReactModal>
            <div id="brand">
                <h1 onClick={props.toggleLanding}>Experiencer</h1>
                <PureMenu id="top-menu" horizontal>
                    <PureDropdown content={<Link>File</Link>}
                        ulProps={{className: "icon-menu"}}>
                        <IconicMenuItem icon="paper" onClick={props.changeTemplate} label="New" />
                        <IconicMenuItem icon="folder-open" onClick={openLoader} label="Load" />
                        <IconicMenuItem onClick={props.saveLocal} label="Save" />
                        <IconicMenuItem icon="save" onClick={openSaver} label="Save As" />
                        <IconicMenuItem icon="file-html5" onClick={props.exportHtml} label="Export to HTML/CSS" />
                        <IconicMenuItem icon="printer" onClick={props.print} label="Print" />
                    </PureDropdown>
                    <Item onClick={props.toggleHelp}>
                        <Link>Help</Link>
                    </Item>
                </PureMenu>
                <div>
                    <a href="https://github.com/vincentlaucsb/experiencer">
                        <Octicon icon={MarkGithub} />
                    </a>
                </div>
                </div>
            </>
    );
}