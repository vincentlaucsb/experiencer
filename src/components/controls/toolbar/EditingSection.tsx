import { Button } from "../Buttons";
import React from "react";
import PureMenu from "../menus/PureMenu";
import { UndoIcon, RedoIcon, SaveIcon } from "../InterfaceIcons";
import { Action } from "src/components/utility/Types";

export interface EditingSectionProps {
    undo?: Action;
    unsavedChanges: boolean;
    redo?: Action;
    saveLocal: Action;
}

/**
 * Return controls for save/undo/redo
 * @param props
 */
export default function EditingSection(props: EditingSectionProps) {
    return (
        <div className="toolbar-section">
            <PureMenu horizontal>
                <Button disabled={!props.unsavedChanges} onClick={props.saveLocal}><SaveIcon /></Button>
                <Button onClick={props.undo} disabled={!props.undo}>
                    <UndoIcon />
                </Button>
                <Button onClick={props.redo} disabled={!props.redo}>
                    <RedoIcon />
                </Button>
            </PureMenu>
            <span className="label">Editing</span>
        </div>
    );
}