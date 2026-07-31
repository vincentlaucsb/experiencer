import React from "react";

import Container from "@/resume/infrastructure/Container";
import ResumeComponentProps from "@/types";

/** Renders a schema-visible grouping node as a plain container. */
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
