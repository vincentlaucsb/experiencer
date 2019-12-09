import React from "react";
import { Container } from "react-bootstrap";

export interface HelpPage {
    title: string;
    children: any;
}

/** Template for help pages */
export default function HelpPage(props: HelpPage) {
    return <Container className="mt-2">
        <h2>{props.title}</h2>
        {props.children}
    </Container>
}