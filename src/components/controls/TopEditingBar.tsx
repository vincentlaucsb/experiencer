import React from "react";
import { Button } from "./Buttons";
import { Action, AddChild, NodeProperty } from "../ResumeNodeBase";
import { IdType } from "../utility/HoverTracker";
import PureMenu, { PureDropdown, PureMenuItem, PureMenuLink } from "./menus/PureMenu";
import ResumeHotKeys from "./ResumeHotkeys";
import { SelectedNodeActions } from "./SelectedNodeActions";
import DescriptionList, { DescriptionListItem } from "../List";
import HtmlIdAdder from "./HtmlIdAdder";
import { assignIds } from "../Helpers";
import { ResumeNode } from "../utility/NodeTree";
import ComponentTypes, { NodeInformation } from "../schema/ComponentTypes";
import toolbarOptions, { CustomToolbarOptions } from "../schema/ToolbarOptions";
import Column from "../Column";
import Grid from "../Grid";
import Row from "../Row";
import Section from "../Section";
import IconicMenuItem from "./menus/MenuItem";
import { Trashcan } from "@primer/octicons-react";
import { TrashIcon, SaveIcon, UndoIcon, RedoIcon } from "./InterfaceIcons";

type AddOptions = Array<NodeInformation>;

interface AddOptionProps {
    options: string | Array<string>;
    addChild: AddChild;
    id: IdType;
}

/**
 * Return the button or menu for adding children to a node
 * @param options
 */
function AddOption(props: AddOptionProps) {
    const options = props.options;
    const nodeInfo = (type: string) => ComponentTypes.defaultValue(type);

    if (Array.isArray(options)) {
        if (options.length === 0) {
            return <></>
        }

        let optionsDetail: AddOptions = options.map((nodeType: string) => nodeInfo(nodeType));
        return <PureDropdown content={<Button>Insert</Button>}>
            {optionsDetail.map((opt) =>
                <IconicMenuItem key={opt.text} icon={opt.icon} label={opt.text} onClick={() => props.addChild(props.id, assignIds(opt.node))} />
            )}
        </PureDropdown>
    }

    const node: NodeInformation = nodeInfo(options as string);
    return (
        <Button onClick={() => props.addChild(props.id, assignIds(node.node))}>
            Add {node.text}
        </Button>
    );
}

export interface EditingBarProps extends SelectedNodeActions {
    selectedNodeId?: IdType;
    selectedNode?: ResumeNode,
    addHtmlId: (htmlId: string) => void;
    addCssClasses: (classes: string) => void;
    updateNode: (key: string, value: NodeProperty) => void;

    addChild: AddChild;
    moveUpEnabled: boolean;
    moveDownEnabled: boolean;
    updateSelected: (key: string, data: any) => void;
    undo: Action;
    unsavedChanges: boolean;
    unselect: Action;
    redo: Action;
    saveLocal: Action;
}

function ClipboardMenu(props: EditingBarProps) {
    /**
     * Get the keyboard shortcut associated with key
     * @param key Resume hotkey key
     */
    const getShortcut = (key: string) : string => {
        return ResumeHotKeys.keyMap[key]['sequence'];
    }
    
    let menuItems = [
        {
            label: 'Cut',
            icon: "ui-cut",
            action: props.cutClipboard, shortcut: getShortcut('CUT_SELECTED')
        },
        {
            label: 'Copy',
            icon: "ui-copy",
            action: props.copyClipboard, shortcut: getShortcut('COPY_SELECTED')
        },
        {
            label: 'Paste',
            icon: "ui-clip-board",
            action: props.pasteClipboard, shortcut: getShortcut('PASTE_SELECTED')
        }
    ];

    return (
        <PureDropdown content={<Button>Clipboard</Button>}>
            {menuItems.map((value) =>
                <IconicMenuItem
                    icon={value.icon}
                    shortcut={value.shortcut}
                    label={value.label}
                    onClick={value.action} />
            )}
        </PureDropdown>
    );
}

/**
 * Subcomponent of TopEditingBar which returns the custom editing options for a node
 * @param props
 */
export function CustomOptions(props: { options: CustomToolbarOptions }) {
    const DropdownItem = (props: any) => <PureMenuItem onClick={props.onClick}>
        <PureMenuLink>{props.children}</PureMenuLink>
    </PureMenuItem>

    return <>
        {props.options.map((item) => {
            if (item.action) {
                return <Button key={item.text} onClick={item.action}>{item.text}</Button>
            }
            else if (item.actions) {
                return <PureDropdown key={item.text} content={<Button>{item.text}</Button>}>
                    {item.actions.map((item) =>
                        <DropdownItem key={item.text} onClick={item.action}>{item.text}</DropdownItem>
                    )}
                </PureDropdown>
            }

            return <></>
        })}
    </>
}

export default function TopEditingBar(props: EditingBarProps) {
    const Item = (props: any) => <PureMenuItem onClick={props.onClick}>
        <Button disabled={props.disabled}>{props.children}</Button>
    </PureMenuItem>

    let children = (
        <>
            <div className="toolbar-section">
                <PureMenu horizontal>
                    <Button disabled={!props.unsavedChanges} onClick={props.saveLocal}><SaveIcon /></Button>
                    <Button onClick={props.undo}>
                        <UndoIcon />
                    </Button>
                    <Button onClick={props.redo}>
                        <RedoIcon />
                    </Button>
                </PureMenu>
                <span className="label">Editing</span>
            </div>
            <div className="toolbar-section">
                <PureMenu horizontal>
                    <Button onClick={() => props.addChild([], assignIds({ type: Section.type }))}>Add Section</Button>
                    <Button onClick={() => props.addChild([], assignIds(ComponentTypes.defaultValue(Row.type).node))}>Add Row & Columns</Button>
                    <Button onClick={() => props.addChild([], assignIds(ComponentTypes.defaultValue(Grid.type).node))}>Add Grid</Button>
                </PureMenu>
                <span className="label">Resume Components</span>
            </div>
        </>
    );

    const id = props.selectedNodeId;
    if (id && props.selectedNode) {
        const type = props.selectedNode.type;
        const customOptions = toolbarOptions(props.selectedNode, props.updateNode);
        let moveUpText = <i className="icofont-rounded-up" />;
        let moveDownText = <i className="icofont-rounded-down" />;

        // If we are selecting a child of a container type,
        // give the option of adding another child to the parent
        const childTypes = ComponentTypes.childTypes(type);
        let parentOptions = <></>

        const htmlId = props.selectedNode.htmlId ?
            <span className="label">#{props.selectedNode.htmlId}</span> :
            <></>

        if (type === DescriptionListItem.type) {
            const parentId = id.slice(0, id.length - 1);
            parentOptions = <AddOption id={parentId} addChild={
                props.addChild as AddChild
            } options={ComponentTypes.childTypes(DescriptionList.type)} />
        }

        if (type === Column.type) {
            moveUpText = <i className="icofont-rounded-left" />
            moveDownText = <i className="icofont-rounded-right" />
        }

        children = (
            <React.Fragment>
                <div className="toolbar-section">
                    <PureMenu horizontal>
                        <AddOption id={id} addChild={props.addChild as AddChild} options={childTypes} />
                        <Item onClick={props.delete}><TrashIcon /></Item>
                        <ClipboardMenu {...props} />
                        <CustomOptions options={customOptions} />
                        <Button onClick={props.unselect}>Unselect</Button>
                    </PureMenu>
                    <span className="label">Current Node ({props.selectedNode.type})</span>
                </div>
                <div className="toolbar-section">
                    <PureMenu horizontal>
                        <Item onClick={() => props.moveUp()} disabled={!props.moveUpEnabled}>{moveUpText}</Item>
                        <Item onClick={() => props.moveDown()} disabled={!props.moveDownEnabled}>{moveDownText}</Item>
                    </PureMenu>
                    <span className="label">Move</span>
                </div>
                <div className="toolbar-section">
                    <PureMenu horizontal>
                        <HtmlIdAdder
                            key={props.selectedNode.uuid}
                            htmlId={props.selectedNode.htmlId}
                            cssClasses={props.selectedNode.classNames}
                            addHtmlId={props.addHtmlId}
                            addCssClasses={props.addCssClasses}
                        />
                    </PureMenu>
                    {htmlId}
                </div>
                {parentOptions}
            </React.Fragment>
        );
    }

    return <div id="toolbar">{children}</div>
}