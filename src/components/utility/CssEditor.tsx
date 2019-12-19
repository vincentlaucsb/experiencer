import CssNode from "./CssTree";
import React from "react";
import MappedTextFields from "../controls/inputs/MappedTextFields";
import Collapse from "../controls/Collapse";

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

    constructor(props: CssEditorProps) {
        super(props);

        this.css = props.root;
        this.state = {
            css: props.root
        };

        this.updateCssProperties = this.updateCssProperties.bind(this);
    }

    get heading() {
        switch (this.props.path.length) {
            case 0:
                return (props: any) => <h2 {...props} />
            case 1:
                return (props: any) => <h3 {...props} />
            case 2:
                return (props: any) => <h4 {...props} />
            case 3:
                return (props: any) => <h5 {...props} />
            default:
                return (props: any) => <h6 {...props} />
        }
    }

    updateCssProperties(data: Map<string, string>) {
        this.css.properties = data;
        this.props.updateParentData(this.css);
        this.setState({ css: this.css });
    }

    /** Highlight all DOM nodes matching the current selector */
    toggleHighlight(highlight = true) {
        const hits = document.querySelectorAll(this.props.root.selector);

        if (highlight) {
            hits.forEach((node: Element) => {
                node.classList.add('resume-highlighted');
            });
        } else {
            hits.forEach((node: Element) => {
                node.classList.remove('resume-highlighted');
            })
        }
    }

    render() {
        const cssProperties = this.props.root.properties;
        const Heading = this.heading;

        if (this.props.isPrinting) {
            return <></>
        }

        const trigger = <Heading onMouseOver={() => this.toggleHighlight()} onMouseOut={() => this.toggleHighlight(false)}>
            {this.props.root.name} <span>({this.props.root.fullSelector})</span>
        </Heading>

        const isOpen = (this.props.path.length != 1);

        return (
            <section className="css-category no-print">
                <Collapse trigger={trigger} isOpen={isOpen}>
                    <MappedTextFields value={cssProperties} updateValue={(data) => {
                        this.updateCssProperties(data);
                    }} />

                    {this.state.css.children.map(
                        (css, index) => {
                            const path = [...this.props.path, css.name];
                            return <CssEditor key={index} path={path} root={css}
                                updateParentData={
                                    (css: CssNode) => {
                                        // TODO: Is the following operation safe?
                                        this.css.children[index] = css;
                                        this.props.updateParentData(this.css);
                                        this.setState({
                                            css: this.css
                                        });
                                    }
                                }

                            />
                        })}
                </Collapse>
            </section>
        );
    }
}