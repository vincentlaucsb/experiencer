import React from "react";
import CloseIcon from "@/assets/icons/close-24px.svg?url";
import { Action } from "@/types";
import { Button } from "@/controls/Buttons";

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
            <Button aria-label="Close Help" onClick={props.close}>
                <img className="cursor-pointer" src={CloseIcon} alt="" />
            </Button>
        </div>

        {backButton}

        {props.children}
    </div>
}
