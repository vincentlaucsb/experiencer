import React from "react";
import { Container, } from "react-bootstrap";
import { Action } from "../ResumeNodeBase";

import CloseIcon from "../../icons/close-24px.svg";
import { withTooltip } from "../controls/Buttons";

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
        <Container className="mb-2">
            <a href="#" onClick={props.returnHome}>{'\u2190'} Go Back</a>
        </Container> : <></>

    const CloseButton = withTooltip('span', "Close Help", "close-help");

    return <Container className="mt-2">
        <div className="d-flex flex-row justify-content-between">
            <h2>{props.title}</h2>
            <CloseButton>
                <img className="cursor-pointer"
                    onClick={props.close}
                    src={CloseIcon} alt="Close Help" />
            </CloseButton>
        </div>

        {backButton}

        {props.children}
    </Container>
}