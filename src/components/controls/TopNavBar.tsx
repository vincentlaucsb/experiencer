﻿import { Action } from "../ResumeNodeBase";
import React from "react";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import { EditorMode } from "../ResumeComponent";
import { isUndefined } from "util";
import { Button } from "./Buttons";
import PureMenu, { PureMenuItem, PureMenuLink, PureDropdown } from "./PureMenu";
import Octicon, { DesktopDownload, Home, MarkGithub } from "@primer/octicons-react";
import ReactModal from "react-modal";

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

    const helpOk = ['normal', 'help'].indexOf(props.mode) >= 0; 

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
                    <PureDropdown content={<Link>File</Link>}>
                        <Item onClick={props.changeTemplate}>
                            <Link>New</Link>
                        </Item>
                        <Item className="load" onClick={openLoader}>
                            <Link>Load</Link>
                        </Item>
                        <Item onClick={props.saveLocal}>
                            <Link>Save</Link>
                        </Item>
                        <Item className="save-as" onClick={openSaver}>
                            <Link><i className="icofont-diskette" />Save As</Link>
                        </Item>
                        <Item className="html-export" onClick={props.exportHtml}>
                            <Link>Export to HTML/CSS</Link>
                        </Item>
                        <Item className="print" onClick={props.print}>
                            <Link>Print</Link>
                        </Item>
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