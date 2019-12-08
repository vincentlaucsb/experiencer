import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-github";

import ResumeState from "./ResumeState";
import React from "react";
import { ButtonToolbar, Button } from "react-bootstrap";
import { Action } from "../ResumeComponent";

interface StyleEditorProps extends ResumeState {
    onStyleChange: (css: string) => void;
    renderStyle: Action;
    toggleStyleEditor: Action;
}

export default function StyleEditor(props: StyleEditorProps) {
    return <>
        <AceEditor
            mode="css"
            theme="github"
            onChange={props.onStyleChange}
            value={props.customCss}
            name="style-editor"
            editorProps={{ $blockScrolling: true }}
        />

        <ButtonToolbar className="mt-2">
            <Button onClick={props.renderStyle}>Apply</Button>
            <Button onClick={props.toggleStyleEditor}>Done</Button>
        </ButtonToolbar>
    </>
}