import CssNode from "./CssTree";
import React from "react";
import MappedTextFields from "../controls/inputs/MappedTextFields";
import Collapse from "../controls/Collapse";

export interface CssEditorProps {
    isPrinting?: boolean;
    root: CssNode;
    updateData: (path: string[], key: string, value: string) => void;
    deleteData: (path: string[], key: string) => void;
}

export default class CssEditor extends React.Component<CssEditorProps> {
    get path() {
        return this.props.root.fullPath;
    }

    get heading() {
        switch (this.path.length) {
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

        const isOpen = (this.path.length !== 1);

        return (
            <section className="css-category no-print">
                <Collapse trigger={trigger} isOpen={isOpen}>
                    <MappedTextFields value={cssProperties}
                        updateValue={this.props.updateData.bind(this, this.path)}
                        deleteValue={this.props.deleteData.bind(this, this.path)} />

                    {this.props.root.children.map(
                        (css, index) => {
                            return <CssEditor
                                key={css.fullSelector}
                                root={css}
                                updateData={this.props.updateData}
                                deleteData={this.props.deleteData}
                            />
                        })}
                </Collapse>
            </section>
        );
    }
}