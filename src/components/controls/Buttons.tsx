import * as React from "react";
import { ResumeNodeProps, Action } from "../ResumeNodeBase";

export function Button(props: any) {
    return (
        <button className="pure-button" onClick={props.onClick}>
            {props.children}
        </button>
    );
}