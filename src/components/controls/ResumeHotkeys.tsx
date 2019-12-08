import React from "react";
import { GlobalHotKeys } from "react-hotkeys";
import { Action } from "../ResumeComponent";
import ResumeState from "./ResumeState";

export interface ResumeHotKeysProps extends ResumeState {
    /** Editing */
    copyClipboard: Action;
    pasteClipboard: Action;

    /** Editor Modes */
    togglePrintMode: Action;
    reset: Action;
};

export default class ResumeHotKeys extends React.Component<ResumeHotKeysProps> {
    constructor(props) {
        super(props);
    }

    public static readonly keyMap = {
        COPY_SELECTED: "shift+c",
        EDIT_SELECTED: "enter",
        PASTE_SELECTED: "shift+v",
        DELETE_SELECTED: "shift+del",
        ESCAPE: "esc",
        PRINT_MODE: "shift+p"
    };

    /** Delete the currently selected node */
    deleteSelected() {
        if (this.props.selectedNode) {
            this.props.selectedNode.deleteChild();
        }
    }

    getHandlers() {
        const handlers = {
            COPY_SELECTED: (event) => {
                this.props.copyClipboard();
            },

            EDIT_SELECTED: (event) => {
                if (this.props.selectedNode && this.props.selectedNode.toggleEdit) {
                    this.props.selectedNode.toggleEdit();
                }
            },

            PASTE_SELECTED: (event) => {
                this.props.pasteClipboard();
            },

            ESCAPE: (event) => {
                this.props.reset();  
            },

            DELETE_SELECTED: (event) => {
                this.deleteSelected();
            },

            PRINT_MODE: (event) => {
                this.props.togglePrintMode();
            }
        };

        return handlers;
    }

    render() {
        return <GlobalHotKeys
            keyMap={ResumeHotKeys.keyMap}
            handlers={this.getHandlers()}
        />
    }
}