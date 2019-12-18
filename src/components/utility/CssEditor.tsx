import CssNode from "./CssTree";
import React from "react";
import MappedTextFields from "../controls/inputs/MappedTextFields";

export interface CssEditorProps {
    /** Used for traversing the tree */
    isPrinting?: boolean;
    path: Array<string>;
    root: CssNode;

    updateParentData: (css: CssNode) => void;
}

interface CssEditorState {
    css: CssNode;
}

export default class CssEditor extends React.Component<CssEditorProps, CssEditorState> {
    // Temporary instance copy
    css: CssNode;

    constructor(props) {
        super(props);

        this.css = props.css;
        this.state = {
            css: props.root
        };
    }


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

    updateCssProperties(data: Map<string, string>) {
        this.css.properties = data;
        this.props.updateParentData(this.css);

        this.setState({ css: this.css });
    }

    render() {
        const sections = new Array<JSX.Element>();
        const cssProperties = this.props.root.properties;

        const root = this.props.root;
        const Heading = this.heading;

        if (this.props.isPrinting) {
            return <></>
        }

        return (
            <div className="no-print">
                <Heading>
                    {this.props.root.name}
                    <span>({this.props.root.selector})</span>
                </Heading>

                <MappedTextFields value={cssProperties} updateValue={(data) => this.updateCssProperties(data)} />

                {root.children.map(
                    (css, index) => {
                        const path = [...this.props.path, css.name];
                        return <CssEditor key={index} path={path} root={css}
                            updateParentData={
                                (css: CssNode) => {
                                    this.css.children[index] = css;
                                    this.setState({
                                        css: this.css
                                    });
                                }
                            }

                        />
                    }
                )}
            </div>
        );
    }
}