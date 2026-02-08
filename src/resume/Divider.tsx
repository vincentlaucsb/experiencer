import React from "react";
import Container from "@/resume/infrastructure/Container";
import ResumeComponentProps from "@/types";

/** Generic <div> element */
export default class Divider extends React.PureComponent<ResumeComponentProps> {
    static readonly type: string = "Divider";

    render() {
        return (
            <Container displayAs="div" {...this.props}>
                {this.props.children}
            </Container>
        );
    }
}