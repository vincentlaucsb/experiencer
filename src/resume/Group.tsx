import React from "react";

import Container from "@/resume/infrastructure/Container";
import ResumeComponentProps from "@/types";

/** Generic grouping <div> element */
export default class Group extends React.PureComponent<ResumeComponentProps> {
    static readonly type: string = "Group";

    render() {
        return (
            <Container displayAs="div" {...this.props}>
                {this.props.children}
            </Container>
        );
    }
}
