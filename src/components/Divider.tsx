import React from "react";
import Container from "./Container";
import ResumeComponentProps from "./utility/Types";

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