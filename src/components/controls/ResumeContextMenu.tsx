import React from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";
import { IdType, ResumeNode } from "../utility/Types";
import ObservableResumeNodeTree from "../utility/ObservableResumeNodeTree";
import Entry, { EntryProps, BasicEntryProps } from "../Entry";
import Section from "../Section";

export interface ResumeContextProps {
    currentId?: IdType;
    nodes: ObservableResumeNodeTree;
    selectNode: (id: IdType) => void;
}

export default class ResumeContextMenu extends React.Component<ResumeContextProps> {
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
        let header = <></>
        let menu = <></>
        if (this.props.currentId) {
            const currentNode = this.props.nodes.getNodeById(this.props.currentId);

            menu = this.hoveringMenu([...this.props.currentId]);
            header = <h3>{currentNode.type}</h3>
        }

        return (
            <ContextMenu id="resume-menu">
                {header}
                {menu}
            </ContextMenu>
        );
    }
}