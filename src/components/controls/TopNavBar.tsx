import { Action } from "../ResumeNodeBase";
import React from "react";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import GitHub from '../../icons/mark-github.svg';
import { EditorMode } from "../ResumeComponent";
import { isUndefined } from "util";
import { Button, withTooltip } from "./Buttons";
import PureMenu, { PureMenuItem, PureMenuLink } from "./PureMenu";
import Octicon, { DesktopDownload, Home } from "@primer/octicons-react";

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

interface TopTabsProps {
    activeKey: 'File' | 'Edit' | 'Edit Style';
}

function TopTabs(props: TopTabsProps) {
    const Item = PureMenuItem;
    const Link = PureMenuLink;

    const items = ['File', 'Edit', 'Edit Style'];
    
    return (
        <PureMenu horizontal>
            {items.map((item) => {
                const selected = props.activeKey === item;

                return (
                    <Item selected={selected}>
                        <Link>{item}</Link>
                    </Item>
                );
            }
            )}
        </PureMenu>
    );
}

interface ButtonProps {
    children?: any;
    onClick?: any;
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

/** <Nav>
                <Nav.Link href="https://github.com/vincentlaucsb/experiencer"><img src={GitHub} style={{ filter: "invert(1)", height: "30px" }} alt="GitHub" /></Nav.Link>
            </Nav> */

    const Item = PureMenuItem;
    const Link = PureMenuLink;

    return (
        <div id="brand">
            <h1>Experiencer</h1>
            <TopTabs activeKey="File" />
        </div>
    );
}