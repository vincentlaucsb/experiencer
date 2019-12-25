import React from "react";
import { IdType } from "../utility/HoverTracker";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import ResumeNodeTree from "../utility/NodeTree";

export interface ResumeContextProps {
    currentId?: IdType;
    nodes: ResumeNodeTree;
    selectNode: (id: IdType) => void;
}

export default class ResumeContextMenu extends React.Component<ResumeContextProps> {
    get currentNode() {
        if (this.props.currentId) {
            return this.props.nodes.getNodeById(this.props.currentId);
        }
    }

    hoveringMenu(currentNode?: IdType) {
        if (currentNode) {
            let menuItems = Array<IdType>();
            currentNode.pop();

            while (currentNode.length > 0) {
                menuItems.push([...currentNode]);
                currentNode.pop();
            }
            
            return <>
                {menuItems.map((value) => {
                    return <MenuItem onClick={() => this.props.selectNode(value)}>
                        Select {this.props.nodes.getNodeById(value).type}
                    </MenuItem>
                })}
            </>
        }

        return <></>
    }


    render() {
        let menu = <></>
        if (this.props.currentId) {
            menu = this.hoveringMenu([...this.props.currentId]);
        }

        let header = <></>
        if (this.currentNode) {
            header = <h3>{this.currentNode.type}</h3>
        }

        return (
            <ContextMenu id="resume-menu">
                {header}
                {menu}
            </ContextMenu>
        );
    }
}