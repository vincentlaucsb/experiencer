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
    loadData: (data: object) => void;
    saveFile: (filename: string) => void;

    /** Sidebar Actions */
    changeTemplate: Action;
    toggleLanding: Action;
    toggleHelp: Action;
}

/** Conditionally render buttons
 * @param onClick Click action if button is enabled
 */
function getButtonProps(onClick?: any) {
    const enabled = !isUndefined(onClick);

    let props = {
        disabled: !enabled,
        // variant: "outline-light" as ButtonProps["variant"]
    };

    if (enabled) {
        props['onClick'] = onClick;
    }

    return props;
}

/** The top nav bar for the resume editor */
export default function TopNavBar(props: TopNavBarProps) {
    let [isOpen, setOpen] = React.useState(false);

    const helpOk = ['normal', 'help'].indexOf(props.mode) >= 0; 
    const helpButton = helpOk ? <Button onClick={props.toggleHelp}>
        Help</Button> : <></>

    const Item = PureMenuItem;
    const Link = PureMenuLink;

    let [modalContent, setModal] = React.useState(<></>);

    let openSaver = () => {
        console.log("Doing shit");
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
                <Item>
                    <PureDropdown content={<Item><Link>File</Link></Item>}>
                        <Link>New</Link>
                        <Link>Load</Link>
                            <Link>Save</Link>
                            <Item onClick={() => {
                                console.log("opening");
                                openSaver();
                            }}>
                                <Link>Save As</Link>
                                </Item>
                        <Link>Export to HTML/CSS</Link>
                        <Link>Print</Link>
                    </PureDropdown>
                </Item>
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