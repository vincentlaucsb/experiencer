import React from "react";
import { Button } from "./Buttons";
import { Action, ModifyChild, AddChild, CustomToolbarOptions } from "../ResumeNodeBase";
import { IdType } from "../utility/HoverTracker";
import PureMenu, { PureDropdown, PureMenuItem, PureMenuLink } from "./PureMenu";
import ResumeHotKeys from "./ResumeHotkeys";
import { SelectedNodeActions } from "./SelectedNodeActions";
import { ComponentTypes, NodeInformation } from "../ResumeComponent";
import { DescriptionListItem, DescriptionList } from "../List";
import CssIdAdder from "./CssIdAdder";

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
export function AddOption(props: AddOptionProps) {
    const options = props.options;
    const nodeInfo = (type: string) => ComponentTypes.defaultValue(type);

    if (Array.isArray(options)) {
        let optionsDetail: AddOptions = [];

        options.forEach((nodeType: string) => {
            optionsDetail.push(nodeInfo(nodeType))
        });

        return <AddMenu options={optionsDetail} addChild={props.addChild} id={props.id} />
    }

    const node: NodeInformation = nodeInfo(options as string);
    return (
            <Button onClick={() => props.addChild(props.id, node.node)}>
                Add {options}
            </Button>
    );
}

interface AddMenuProps {
    options: AddOptions;
    addChild: AddChild;
    id: IdType;
}

/**
 * Dropdown menu with add options
 * @param props
 */
export function AddMenu(props: AddMenuProps) {
    const button = <Button>Insert</Button>

    return (
        <PureDropdown content={button}>
            {props.options.map((opt) =>
                <PureMenuItem key={opt.text} onClick={() => props.addChild(props.id, opt.node)}>
                    <PureMenuLink>
                        {opt.text}
                    </PureMenuLink>
                </PureMenuItem>
            )}
        </PureDropdown>
    );
}

export interface EditingBarProps extends SelectedNodeActions {
    id: IdType;
    cssId: string;
    type: string;
    addChild: AddChild;
    toggleEdit: ModifyChild;
    moveUpEnabled: boolean;
    moveDownEnabled: boolean;
    updateSelected: (key: string, data: any) => void;

    customOptions?: CustomToolbarOptions;
}

function ClipboardMenu(props: EditingBarProps) {
    const DropdownItem = (props: any) => <PureMenuItem onClick={props.onClick}>
        <PureMenuLink>{props.children}</PureMenuLink>
    </PureMenuItem>

    /**
     * Get the keyboard shortcut associated with key
     * @param key Resume hotkey key
     */
    const getShortcut = (key: string) : string => {
        return ResumeHotKeys.keyMap[key]['sequence'];
    }

    const copySc = getShortcut('COPY_SELECTED');
    const pasteSc = getShortcut('PASTE_SELECTED');
    const cutSc = getShortcut('CUT_SELECTED');

    return (
        <PureMenu horizontal>
            <PureDropdown content={<Button>Clipboard</Button>}>
                <DropdownItem onClick={props.cutClipboard}>Cut ({cutSc})</DropdownItem>
                <DropdownItem onClick={props.copyClipboard}>
                    Copy ({copySc})
                </DropdownItem>
                <DropdownItem onClick={props.pasteClipboard}>Paste ({pasteSc})</DropdownItem>
            </PureDropdown>
        </PureMenu>
    );
}

export default function TopEditingBar(props: EditingBarProps) {
    const DropdownItem = (props: any) => <PureMenuItem onClick={props.onClick}>
        <PureMenuLink>{props.children}</PureMenuLink>
    </PureMenuItem>

    const id = props.id;
    const additionalOptions = props.customOptions ? <>
        {props.customOptions.map((item) => {
            if (item.action) {
                return <Button onClick={item.action}>{item.text}</Button>
            }
            else if (item.actions) {
                return <PureDropdown content={<Button>{item.text}</Button>}>
                    {item.actions.map((item) =>
                        <DropdownItem onClick={item.action}>{item.text}</DropdownItem>
                    )}
                </PureDropdown>
            }
        }
            
        )}
    </> : <></>

    const Item = (props: any) => <PureMenuItem onClick={props.onClick}>
        <Button disabled={props.disabled}>{props.children}</Button>
    </PureMenuItem>

    // If we are selecting a child of a container type,
    // give the option of adding another child to the parent
    const childTypes = ComponentTypes.childTypes(props.type);
    let parentAddOption = <></>

    if (props.type === DescriptionListItem.name) {
        const parentId = id.slice(0, id.length - 1);
        parentAddOption = <AddOption id={parentId} addChild={
            props.addChild as AddChild
        } options={ComponentTypes.childTypes(DescriptionList.name)} />
    }

    return <div id="toolbar">
        <div>
            <PureMenu horizontal>
                {parentAddOption}
                <AddOption id={id} addChild={props.addChild as AddChild} options={childTypes} />
                <Item onClick={props.delete}>Delete</Item>
                <Item onClick={() => (props.toggleEdit as ModifyChild)(id)}>Edit</Item>
                <Item onClick={() => props.moveUp()}
                    disabled={!props.moveUpEnabled}
                >Move Up</Item>
                <Item onClick={() => props.moveDown()}
                    disabled={!props.moveDownEnabled}
                >Move Down</Item>
                <CssIdAdder cssId={props.cssId} updateData={props.updateSelected} />
                {additionalOptions}
            </PureMenu>
        </div>
        <div>
            <ClipboardMenu {...props} />
        </div>
    </div>
}