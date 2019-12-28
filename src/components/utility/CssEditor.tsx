import CssNode from "./CssTree";
import React from "react";
import MappedTextFields, { ContainerProps } from "../controls/inputs/MappedTextFields";
import Collapse from "../controls/Collapse";
import { Button } from "../controls/Buttons";
import TextField from "../controls/inputs/TextField";
import ReactDOM from "react-dom";
import CssSuggestions from "./CssSuggestions";
import CssEditorToolbar from "./CssEditorToolbar";

export interface CssEditorProps {
    autoCollapse?: boolean;
    root: CssNode;
    addSelector: (path: string[], name: string, selector: string) => void;
    updateData: (path: string[], key: string, value: string) => void;
    updateDescription: (path: string[], data: string) => void;
    deleteKey: (path: string[], key: string) => void;
    deleteNode: (path: string[]) => void;
}

export interface CssEditorState {
    editingDescription: boolean;
    highlight: boolean;
}

export default class CssEditor extends React.Component<CssEditorProps, CssEditorState> {
    constructor(props) {
        super(props);

        this.state = {
            editingDescription: false,
            highlight: false
        };

        this.mapContainer = this.mapContainer.bind(this);
    }

    /** A list of suggested CSS properties */
    get cssProperties() {
        return CssSuggestions.properties;
    }

    get highlighter() {
        let className = "hl";
        if (this.state.highlight) {
            className += " hl-active";
        }

        return (
            <Button
                className={className}
                onClick={(event) => {
                    this.setState({ highlight: !this.state.highlight });
                    event.stopPropagation();
                }}>
                <i className="icofont-binoculars" />
            </Button>
        );
    }

    get varSuggestions() {
        const treeRoot = this.props.root.treeRoot;
        let suggestions = new Array<string>();

        if (treeRoot && treeRoot.cssRoot) {
            for (let k of treeRoot.cssRoot.properties.keys()) {
                // Variable declaration
                if (k.slice(0, 2) === '--') {
                    suggestions.push(`var(${k})`);
                }
            }
        }

        return suggestions;
    }

    get path() {
        return this.props.root.fullPath;
    }
    
    /**
     * Contains the rows of a CSS ruleset
     * @param props
     */
    mapContainer(selector: string, props: ContainerProps) {
        return (
            <div className="css-ruleset" onClick={props.onClick}>
                {selector} {"{"}
                <table className="css-ruleset-table">
                    <tbody>
                        {props.children}
                    </tbody>
                </table>
                {"}"}
            </div>
        );
    }

    /** Highlight all DOM nodes matching the current selector */
    renderHighlightBoxes() {
        let selector = this.props.root.fullSelector;
        try {
            const hits = document.querySelectorAll(selector);
            const root = document.getElementById("resume");
            if (root && this.state.highlight) {
                let elems = new Array<JSX.Element>();
                hits.forEach((node: Element, key: number) => {
                    const bounds = node.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(node);

                    let left = `calc(${bounds.left}px - ${computedStyle.marginLeft})`;
                    let top = `calc(${bounds.top}px - ${computedStyle.marginTop})`

                    elems.push(<div className="resume-hl-box"
                        key={key}
                        style={{
                            position: "fixed",
                            borderLeftWidth: `${computedStyle.marginLeft}`,
                            borderRightWidth: `${computedStyle.marginRight}`,
                            borderTopWidth: `${computedStyle.marginTop}`,
                            borderBottomWidth: `${computedStyle.marginBottom}`,
                            left: left,
                            width: `${bounds.width}px`,
                            height: `${bounds.height}px`,
                            top: top,
                            zIndex: 2000
                        }}
                    />);
                });

                return ReactDOM.createPortal(elems, root);
            }
        }
        catch (e) {
            // TODO: Handle invalid selectors
            console.log(e);
        }
    }

    /** Render the set of CSS properties */
    renderProperties() {
        const cssProperties = this.props.root.properties;
        const genericValueSuggestions = this.varSuggestions;

        // 'initial', 'inherit', 'unset' apply to all CSS properties
        // https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax
        genericValueSuggestions.concat(['initial', 'inherit', 'unset']);

        let root = <></>
        let cssRoot = this.props.root.cssRoot as CssNode;
        if (cssRoot) {
            root = <MappedTextFields value={cssRoot.properties}
                    container={(props) => this.mapContainer(":root", props)}
                    updateValue={(key: string, value: string) => {
                        cssRoot.setProperty([], key, value);
                    }}
                    deleteKey={(key: string) => { cssRoot.deleteProperty([], key); }} />
        }

        return (
            <>
                <MappedTextFields value={cssProperties}
                    container={(props) => this.mapContainer(this.props.root.fullSelector, props)}
                    updateValue={this.props.updateData.bind(this, this.path)}
                    deleteKey={this.props.deleteKey.bind(this, this.path)}
                    keySuggestions={Array.from(this.cssProperties.keys())}
                    genericValueSuggestions={genericValueSuggestions}
                    valueSuggestions={this.cssProperties}
                />
                {root}
            </>
        );
    }

    renderChildren() {
        return this.props.root.children.map((css: CssNode) => {
            return <CssEditor
                key={css.fullPath.join('-')}
                root={css}
                autoCollapse={this.props.autoCollapse}
                addSelector={this.props.addSelector}
                updateData={this.props.updateData}
                updateDescription={this.props.updateDescription}
                deleteKey={this.props.deleteKey}
                deleteNode={this.props.deleteNode}
                />
        });
    }

    renderDescription() {
        return <TextField
            value={this.props.root.description || ""}
            displayClassName="css-description"
            onChange={(text) => {
                this.props.updateDescription(this.path, text);
            }}
        />
    }

    render() {
        const trigger = <h2 className="css-title-heading">
            <span className="css-title">
                {this.props.root.name}
            </span>
            {this.highlighter}
            <CssEditorToolbar
                root={this.props.root}
                addSelector={(name, selector) => this.props.addSelector(this.path, name, selector)}
                deleteNode={() => this.props.deleteNode(this.path)}
            />
        </h2>

        const isOpen = (this.path.length !== 1) || !this.props.autoCollapse;

        return (
            <section className={`css-category no-print css-category-${this.path.length}`}>
                {this.renderHighlightBoxes()}
                <Collapse trigger={trigger} isOpen={isOpen}>
                    <div className="css-category-content">
                        {this.renderDescription()}
                        {this.renderProperties()}
                        {this.renderChildren()}
                    </div>
                </Collapse>
            </section>
        );
    }
}