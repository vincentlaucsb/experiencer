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
    constructor(props) {
        super(props);

        this.mapContainer = this.mapContainer.bind(this);
    }

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

    /**
     * Contains the rows of a CSS ruleset
     * @param props
     */
    mapContainer(props: any) {
        return <table>
            <tbody>
                {props.children}
            </tbody>
        </table>
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

    /** Render the set of CSS properties */
    renderProperties() {
        const cssProperties = this.props.root.properties;
        const selector = this.props.root.fullSelector;


        return (
            <div className="css-ruleset">
                <strong>{selector} {"{"}</strong>
                <MappedTextFields value={cssProperties}
                container={this.mapContainer}
                updateValue={this.props.updateData.bind(this, this.path)}
                deleteValue={this.props.deleteData.bind(this, this.path)} />
                {"}"}
            </div>
        );
    }

    renderChildren() {
        return this.props.root.children.map(
            (css, index) => {
                return <CssEditor
                    key={css.fullSelector}
                    root={css}
                    updateData={this.props.updateData}
                    deleteData={this.props.deleteData}
                />
            });
    }

    render() {
        if (this.props.isPrinting) {
            return <></>
        }

        const trigger = <h2 onMouseOver={() => this.toggleHighlight()} onMouseOut={() => this.toggleHighlight(false)}>
            {this.props.root.name}
        </h2>

        const isOpen = (this.path.length !== 1);

        return (
            <section className={`css-category no-print css-category-${this.path.length}`}>
                <Collapse trigger={trigger} isOpen={isOpen}>
                    <div className="css-category-content">
                        {this.renderProperties()}
                        {this.renderChildren()}
                    </div>
                </Collapse>
            </section>
        );
    }
}