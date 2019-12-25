import React from "react";
import { IdType } from "../utility/HoverTracker";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

export interface ResumeContextProps {
    currentId?: IdType;
    selectNode: (id: IdType) => void;
}

export interface ResumeContextState {
    stopUpdating: boolean;
}

export default class ResumeContextMenu extends React.Component<ResumeContextProps, ResumeContextState> {
    constructor(props) {
        super(props);

        this.state = {
            stopUpdating: false
        }

        this.hideHandler = this.hideHandler.bind(this);
    }

    hideHandler() {
        console.log("Menu was hidden");
        this.setState({ stopUpdating: false });
    }

    hoveringMenu(currentNode?: IdType) {
        console.log(currentNode);

        if (currentNode) {
            let menuItems = Array<IdType>();

            console.log(currentNode);

            while (currentNode.length > 0) {
                menuItems.push([...currentNode]);
                currentNode.pop();
            }

            console.log(menuItems);

            return <>
                {menuItems.map((value) => {
                    return <MenuItem onClick={() => this.props.selectNode(value)}>
                        {value}
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

        return (
            <ContextMenu id="resume-menu"
                onShow={() => {
                    console.log("Menu is showing");
                    this.setState({ stopUpdating: true });
                }}
                onHide={this.hideHandler}
            >
                {menu}
            </ContextMenu>
        );
    }
}