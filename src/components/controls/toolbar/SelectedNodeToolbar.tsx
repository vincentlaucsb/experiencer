import { EditingBarProps } from "../TopEditingBar";
import toolbarOptions from "src/components/schema/ToolbarOptions";
import ComponentTypes, { NodeInformation } from "src/components/schema/ComponentTypes";
import DescriptionList, { DescriptionListItem } from "src/components/List";
import React from "react";
import { AddChild, IdType } from "src/components/utility/Types";
import Column from "src/components/Column";
import PureMenu, { PureMenuItem, PureDropdown } from "../menus/PureMenu";
import HtmlIdAdder from "../HtmlIdAdder";
import { Button } from "../Buttons";
import IconicMenuItem from "../menus/MenuItem";
import { AddIcon, ClipboardIcon, TrashIcon } from "../InterfaceIcons";
import { assignIds } from "src/components/Helpers";
import ResumeHotKeys from "../ResumeHotkeys";
import AccordionMenu from "./AccordionMenu";
import { ToolbarSection } from "./ToolbarMaker";

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
        return <PureDropdown
            content={<Button className="button-text"><AddIcon />Insert</Button>}
            ulProps={{ className: "icon-menu" }}
        >
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


function ClipboardMenu(props: EditingBarProps) {
    /**
     * Get the keyboard shortcut associated with key
     * @param key Resume hotkey key
     */
    const getShortcut = (key: string): string => {
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
        <PureDropdown
            content={<Button><ClipboardIcon /></Button>}
            ulProps={{ className: "icon-menu" }}>
            {menuItems.map((value) =>
                <IconicMenuItem key={value.label}
                    icon={value.icon}
                    shortcut={value.shortcut}
                    label={value.label}
                    onClick={value.action} />
            )}
        </PureDropdown>
    );
}

interface EditingBarSubProps extends EditingBarProps {
    isOverflowing: boolean;
}

export default function SelectedNodeToolbar(props: EditingBarSubProps) {
    const Item = (props: any) => <PureMenuItem onClick={props.onClick}>
        <Button disabled={props.disabled}>{props.children}</Button>
    </PureMenuItem>

    const id = props.selectedNodeId;
    if (id && props.selectedNode) {
        const type = props.selectedNode.type;
        let moveUpText = "icofont-rounded-up";
        let moveDownText = "icofont-rounded-down";

        // If we are selecting a child of a container type,
        // give the option of adding another child to the parent
        const childTypes = ComponentTypes.childTypes(type);
        let parentOptions = <></>

        const htmlId = props.selectedNode.htmlId ? `#${props.selectedNode.htmlId}` : '';

        if (type === DescriptionListItem.type) {
            const parentId = id.slice(0, id.length - 1);
            parentOptions = <AddOption id={parentId} addChild={
                props.addChild as AddChild
            } options={ComponentTypes.childTypes(DescriptionList.type)} />
        }

        if (type === Column.type) {
            moveUpText = "icofont-rounded-left";
            moveDownText = "icofont-rounded-right";
        }

        let nodeOptions = <div className="toolbar-section">
            <AddOption id={id} addChild={props.addChild as AddChild} options={childTypes} />
            <ClipboardMenu {...props} />
        </div>

        return new Map<string, ToolbarSection>([
            [`Current Node (${props.selectedNode.type})`, [
                {
                    action: props.delete,
                    icon: 'icofont-ui-delete'
                },
                {
                    action: props.unselect,
                    text: 'Unselect'
                },
                ...toolbarOptions(props.selectedNode, props.updateSelected)
            ]],
            ["Move", [
                {
                    action: props.moveUp,
                    icon: moveUpText
                },
                {
                    action: props.moveDown,
                    icon: moveDownText
                }
            ]],
            [htmlId, [
                {
                    content: <HtmlIdAdder
                        key={props.selectedNode.uuid}
                        htmlId={props.selectedNode.htmlId}
                        cssClasses={props.selectedNode.classNames}
                        addHtmlId={props.addHtmlId}
                        addCssClasses={props.addCssClasses} />
                }
            ]]
        ]);
    }

    return new Map<string, ToolbarSection>();
}