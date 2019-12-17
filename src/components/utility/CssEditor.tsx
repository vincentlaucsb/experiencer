import CssNode from "./CssTree";
import React from "react";

export interface CssEditorProps {
    /** Used for traversing the tree */
    path: Array<string>;
    root: CssNode;
}

export default class CssEditor extends React.Component<CssEditorProps> {
    get heading() {
        switch (this.props.path.length) {
            case 0:
                return (props: any) => <h2>{props.children}</h2>
            case 1:
                return (props: any) => <h3>{props.children}</h3>
            case 2:
                return (props: any) => <h4>{props.children}</h4>
            case 3:
                return (props: any) => <h4>{props.children}</h4>
            case 4:
                return (props: any) => <h5>{props.children}</h5>
            default:
                return (props: any) => <h6>{props.children}</h6>
        }
    }

    render() {
        const cssProperties = this.props.root.properties;
        const sections = new Array<JSX.Element>();
        const root = this.props.root;
        const Heading = this.heading;

        return (
            <div>
                <Heading>{this.props.root.name}</Heading>
                {root.children.map(
                    (css) => {
                        const path = [...this.props.path, css.name];
                        return <CssEditor path={path} root={css} />
                    }
                )}
            </div>
        );
    }
}