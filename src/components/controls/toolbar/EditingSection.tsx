import { Button } from "../Buttons";
import React from "react";
import PureMenu from "../menus/PureMenu";
import { Action } from "src/components/ResumeNodeBase";
import { UndoIcon, RedoIcon, SaveIcon } from "../InterfaceIcons";

export interface EditingSectionProps {
    undo: Action;
    unsavedChanges: boolean;
    redo: Action;
    saveLocal: Action;
}

export default function EditingSection(props: EditingSectionProps) {
    return (
        <div className="toolbar-section">
            <PureMenu horizontal>
                <Button disabled={!props.unsavedChanges} onClick={props.saveLocal}><SaveIcon /></Button>
                <Button onClick={props.undo}>
                    <UndoIcon />
                </Button>
                <Button onClick={props.redo}>
                    <RedoIcon />
                </Button>
            </PureMenu>
            <span className="label">Editing</span>
        </div>
    );
}