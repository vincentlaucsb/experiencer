import React from "react";
import { ContextMenu, MenuItem } from "@/controls/ContextMenu";
import { IdType, ResumeNode, NodeProperty } from "@/shared/utils/Types";
import ObservableResumeNodeTree from "@/editor/ObservableResumeNodeTree";
import Section from "@/resume/Section";
import contextMenuOptions from "@/shared/schema/ContextMenuOptions";
import RichText from "@/resume/RichText";
import Link from "@/resume/Link";
import ReactDOM from "react-dom";
import { createContainer } from "@/shared/utils/Helpers";

export interface ResumeContextProps {
    currentId?: IdType;
    nodes: ObservableResumeNodeTree;
    editSelected: () => void;
    updateSelected: (key: string, data: NodeProperty) => void;
    selectNode: (id: IdType) => void;
}

export default class ResumeContextMenu extends React.Component<ResumeContextProps> {
    static Editable = new Set<string>([
        RichText.type,
        Link.type
    ]);

    hoveringMenu(currentNode?: IdType) {
        if (currentNode) {
            let menuItems = Array<IdType>();
            currentNode.pop();

            while (currentNode.length > 0) {
                menuItems.push([...currentNode]);
                currentNode.pop();
            }
            
            return <>
                {menuItems.map((id) => {
                    return this.selectOption(id);
                })}
            </>
        }

        return <></>
    }

    selectOption(id: IdType) {
        const node = this.props.nodes.getNodeById(id) as ResumeNode;
        let text = "";

        switch (node.type) {
            case Section.type:
                text = `${node.type}: ${node.value}`
                break
            default:
                text = node.type
        }

        return <MenuItem key={node.uuid}
            onClick={() => this.props.selectNode(id)}>
            Select {text}
        </MenuItem>
    }

    render() {
        let isEditable = false;

        let header = <></>
        let menu = <></>
        let editOption = <></>
        let customOptions: React.ReactNode = <></>

        if (this.props.currentId) {
            const currentNode = this.props.nodes.getNodeById(this.props.currentId);
            const rawCustomOptions = contextMenuOptions(currentNode, this.props.updateSelected);
            if (rawCustomOptions) {
                customOptions = rawCustomOptions.map((option) => {
                    return <MenuItem onClick={option.action}>{option.text}</MenuItem>
                });
            }

            if (currentNode) {
                menu = this.hoveringMenu([...this.props.currentId]);
                header = <h3>{currentNode.type}</h3>

                isEditable = ResumeContextMenu.Editable.has(currentNode.type);
                if (isEditable) {
                    editOption = <MenuItem onClick={this.props.editSelected}>Edit</MenuItem>
                }
            }
        }

        const additionalOptions = (
            <>
                {editOption}
                {customOptions}
            </>
        );

        const hrule = isEditable ? <hr /> : <></>

        const contextMenuContainer = createContainer("context-menu-container");
        return ReactDOM.createPortal(
            <ContextMenu id="resume-menu">
                {header}
                {menu}
                {hrule}
                {additionalOptions}
            </ContextMenu>,
            contextMenuContainer);
    }
}