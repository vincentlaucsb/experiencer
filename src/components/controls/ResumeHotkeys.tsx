import React from "react";
import { GlobalHotKeys, KeyMap, ExtendedKeyMapOptions } from "react-hotkeys";
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

    public static readonly keyMap: KeyMap = {
        COPY_SELECTED: {
            name: 'Copy Node',
            description: 'Copy the selected node',
            sequence: "shift+c"
        } as ExtendedKeyMapOptions,

        EDIT_SELECTED: {
            name: 'Edit Node',
            description: 'Edit the selected node',
            sequence: "enter"
        } as ExtendedKeyMapOptions,

        PASTE_SELECTED: {
            name: 'Paste Node',
            description: 'Paste the clipboard as a child of the currently selected node',
            sequence: 'shift+v'
        } as ExtendedKeyMapOptions,

        DELETE_SELECTED: {
            name: 'Deleted Node',
            description: 'Delete the currently selected node',
            sequence: 'shift+del'
        } as ExtendedKeyMapOptions,

        ESCAPE: {
            name: 'Escape',
            description: 'Unselect the selected node and return to normal editing mode',
            sequence: "esc"
        } as ExtendedKeyMapOptions,

        PRINT_MODE: {
            name: 'Print Mode',
            description: 'Toggle between normal and print mode',
            sequence: "shift+p"
        } as ExtendedKeyMapOptions
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