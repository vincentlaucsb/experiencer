import { Action } from "../ResumeNodeBase";
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

    interface MenuItemProps {
        onClick: (event: React.MouseEvent) => void;
        icon?: string;
        label: string;
    }

    const MenuItem = (props: MenuItemProps) => {
        let icon = <></>
        if (props.icon) {
            icon = <i className={`icofont-${ props.icon }`} />
        }

        const spanClass = props.icon ? "label" : "label no-icon";

        return (
            <Item onClick={props.onClick}>
                {icon}
                <span className={spanClass}>{props.label}</span>
            </Item>
        );    
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
                        <MenuItem icon="paper" onClick={props.changeTemplate} label="New" />
                        <MenuItem icon="folder-open" onClick={openLoader} label="Load" />
                        <MenuItem onClick={props.saveLocal} label="Save" />
                        <MenuItem icon="save" onClick={openSaver} label="Save As" />
                        <MenuItem icon="file-html5" onClick={props.exportHtml} label="Export to HTML/CSS" />
                        <MenuItem icon="printer" onClick={props.print} label="Print" />
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