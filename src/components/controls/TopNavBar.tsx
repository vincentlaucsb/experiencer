import { Action } from "../ResumeNodeBase";
import React from "react";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import { EditorMode } from "../ResumeComponent";
import { isUndefined } from "util";
import { Button } from "./Buttons";
import PureMenu, { PureMenuItem, PureMenuLink } from "./PureMenu";
import Octicon, { DesktopDownload, Home, MarkGithub } from "@primer/octicons-react";

interface TopNavBarProps {
    mode: EditorMode;

    /** Loading and Saving */
    loadData: (data: object) => void;
    saveFile: (filename: string) => void;

    /** Sidebar Actions */
    changeTemplate: Action;
    toggleLanding: Action;
    toggleHelp: Action;
    toggleStyleEditor: Action;
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
    const isEditingStyle = props.mode === 'editingStyle';

    const editStyleProps = {
        onClick: props.toggleStyleEditor,
        // variant: isEditingStyle ? "light" : "outline-light" as ButtonProps["variant"]
    };

    const helpOk = ['normal', 'help', 'editingStyle'].indexOf(props.mode) >= 0; 
    const helpButton = helpOk ? <Button onClick={props.toggleHelp}>
        Help</Button> : <></>

    const Item = PureMenuItem;
    const Link = PureMenuLink;

    return (
        <div id="brand">
            <h1 onClick={props.toggleLanding}>Experiencer</h1>
            <PureMenu horizontal>
                <Item onClick={props.toggleStyleEditor}>
                    <Link>Edit Style</Link>
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
    );
}