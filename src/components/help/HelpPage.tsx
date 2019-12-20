import React from "react";
import { Action } from "../ResumeNodeBase";

import CloseIcon from "../../icons/close-24px.svg";

export interface HelpPageActions {
    close: Action;
    returnHome?: Action;
}

interface HelpPageProps extends HelpPageActions {
    title: string;
    children: any;
}

/** Template for help pages */
export default function HelpPage(props: HelpPageProps) {
    const backButton = props.returnHome ?
        <a href="#" onClick={props.returnHome}>{'\u2190'} Go Back</a> : <></>
    
    return <div>
        <div className="d-flex flex-row justify-content-between">
            <h2>{props.title}</h2>
            <button>
                <img className="cursor-pointer"
                    onClick={props.close}
                    src={CloseIcon} alt="Close Help" />
            </button>
        </div>

        {backButton}

        {props.children}
    </div>
}