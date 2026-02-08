import React from "react";
import { ContextMenu, MenuItem } from "@/controls/ContextMenu";
import { ResumeNode, NodeProperty } from "@/types";
import Section from "@/resume/Section";
import contextMenuOptions from "@/resume/schema/ContextMenuOptions";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";
import ReactDOM from "react-dom";
import { createContainer } from "@/shared/utils/Helpers";

export interface ResumeContextProps {
    currentId?: string;  // UUID
    getNode: (uuid: string) => ResumeNode | undefined;
    getParentUuids: (uuid: string) => string[];  // Returns array of parent UUIDs from bottom to top
    editSelected: () => void;
    updateSelected: (key: string, data: NodeProperty) => void;
    selectNode: (uuid: string) => void;
}

export default class ResumeContextMenu extends React.Component<ResumeContextProps> {
    static Editable = new Set<string>([
        MarkdownText.type,
        Link.type
    ]);

    hoveringMenu(currentNode?: ResumeNode) {
        if (currentNode) {
            const parentUuids = this.props.getParentUuids(currentNode.uuid);
            
            return <>
                {parentUuids.map((uuid) => {
                    return this.selectOption(uuid);
                })}
            </>
        }

        return <></>
    }

    selectOption(uuid: string) {
        const node = this.props.getNode(uuid);
        if (!node) return null;
        
        let text = "";

        switch (node.type) {
            case Section.type:
                text = `${node.type}: ${node.value}`
                break
            default:
                text = node.type
        }

        return <MenuItem key={node.uuid}
            onClick={() => this.props.selectNode(uuid)}>
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
            const currentNode = this.props.getNode(this.props.currentId);
            
            if (currentNode) {
                const rawCustomOptions = contextMenuOptions(currentNode, this.props.updateSelected);
                if (rawCustomOptions) {
                    customOptions = rawCustomOptions.map((option) => {
                        return <MenuItem onClick={option.action}>{option.text}</MenuItem>
                    });
                }

                menu = this.hoveringMenu(currentNode);
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