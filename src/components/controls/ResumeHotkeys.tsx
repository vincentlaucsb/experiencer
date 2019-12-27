import React from "react";
import { GlobalHotKeys, KeyMap, ExtendedKeyMapOptions } from "react-hotkeys";
import { Action } from "../ResumeNodeBase";
import { SelectedNodeActions } from "./SelectedNodeActions";

export interface ResumeHotKeysProps extends SelectedNodeActions {
    /** Editor Modes */
    togglePrintMode: Action;
    reset: Action;
    undo: Action;
    redo: Action;
};

export default class ResumeHotKeys extends React.Component<ResumeHotKeysProps> {
    public static readonly keyMap: KeyMap = {
        COPY_SELECTED: {
            name: 'Copy Node',
            description: 'Copy the selected node',
            sequence: "ctrl+c"
        } as ExtendedKeyMapOptions,

        CUT_SELECTED: {
            name: 'Cut Node',
            description: 'Cut the selected node',
            sequence: "ctrl+x"
        } as ExtendedKeyMapOptions,

        EDIT_SELECTED: {
            name: 'Edit Node',
            description: 'Edit the selected node',
            sequence: "enter"
        } as ExtendedKeyMapOptions,

        PASTE_SELECTED: {
            name: 'Paste Node',
            description: 'Paste the clipboard as a child of the currently selected node',
            sequence: 'ctrl+v'
        } as ExtendedKeyMapOptions,

        DELETE_SELECTED: {
            name: 'Deleted Node',
            description: 'Delete the currently selected node',
            sequence: 'del'
        } as ExtendedKeyMapOptions,

        UNDO: {
            name: 'Undo',
            sequence: 'ctrl+z'
        } as ExtendedKeyMapOptions,

        REDO: {
            name: 'Redo',
            sequence: 'ctrl+y'
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

    getHandlers() {
        const handlers = {
            COPY_SELECTED: (event) => {
                this.props.copyClipboard();
            },

            CUT_SELECTED: (event) => {
                this.props.cutClipboard();
            },

            PASTE_SELECTED: (event) => {
                this.props.pasteClipboard();
            },

            ESCAPE: (event) => {
                this.props.reset();  
            },

            UNDO: (event) => {
                this.props.undo();
            },

            REDO: (event) => {
                this.props.redo();
            },

            DELETE_SELECTED: (event) => {
                this.props.delete();
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