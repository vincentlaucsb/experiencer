import CssNode, { ReadonlyCssNode } from "./CssTree";
import React from "react";
import MappedTextFields, { ContainerProps } from "../controls/inputs/MappedTextFields";
import TextField from "../controls/inputs/TextField";
import ReactDOM from "react-dom";
import CssSuggestions from "./CssSuggestions";
import CssEditorToolbar from "./CssEditorToolbar";

export interface CssUpdateProps {
    addSelector: (path: string[], name: string, selector: string) => void;
    updateName: (path: string[], value: string) => void;
    updateProperty: (path: string[], key: string, value: string) => void;
    updateDescription: (path: string[], data: string) => void;
    updateSelector: (path: string[], selector: string) => void;
    deleteKey: (path: string[], key: string) => void;
    deleteNode: (path: string[]) => void;
}

export interface CssEditorProps extends CssUpdateProps {
    cssNode: ReadonlyCssNode;
    varSuggestions?: Array<string>;

    /** Whether or not the section is open initially */
    isOpen?: boolean;
}

export interface CssEditorState {
    highlight: boolean;
    isOpen: boolean;
}

/**
 * Creates props for a CssEditor instance
 * @param cssTreeRoot
 */
export function makeCssEditorProps(
    cssTreeRoot: CssNode,
    updateCallback: () => void
): CssUpdateProps {
    return {
        addSelector: (path, name, selector) => {
            cssTreeRoot.mustFindNode(path).add(
                name, {}, selector);
            updateCallback();
        },

        updateName: (path, value) => {
            cssTreeRoot.mustFindNode(path).name = value;
            updateCallback();
        },

        updateProperty: (path, key, value) => {
            cssTreeRoot.setProperty(path, key, value);
            updateCallback();
        },

        updateDescription: (path, value) => {
            cssTreeRoot.mustFindNode(path).description = value;
            updateCallback();
        },

        updateSelector: (path, value) => {
            cssTreeRoot.mustFindNode(path).selector = value;
            updateCallback();
        },

        deleteKey: (path, key) => {
            cssTreeRoot.deleteProperty(path, key);
            updateCallback();
        },

        deleteNode: (path) => {
            cssTreeRoot.delete(path);
            updateCallback();
        }
    };
}

export default class CssEditor extends React.Component<CssEditorProps, CssEditorState> {
    constructor(props) {
        super(props);

        this.state = {
            highlight: false,
            isOpen: props.isOpen || false
        };

        this.mapContainer = this.mapContainer.bind(this);
    }

    get description() {
        return <TextField
            defaultText="No description provided"
            value={this.props.cssNode.description || ""}
            displayClassName="css-description"
            onChange={(text) => {
                this.props.updateDescription(this.path, text);
            }}
        />
    }

    get highlighter() {
        let className = "hl";
        if (this.state.highlight) {
            className += " hl-active";
        }

        return (
            <button
                className={className}
                onClick={(event) => {
                    this.setState({ highlight: !this.state.highlight });
                    event.stopPropagation();
                }}>
                <i className="icofont-binoculars" />
            </button>
        );
    }

    get path() {
        return this.props.cssNode.fullPath;
    }

    get sectionName() {
        /** If section is expanded, then clicking on the title should allow
         *  the user the edit it. Otherwise, clicking the title should
         *  expand the section.
         */
        return <TextField
            static={!this.state.isOpen}
            defaultText="Enter a section name"
            value={this.props.cssNode.name}
            displayClassName="css-title"
            onChange={(text) => {
                this.props.updateName(this.path, text);
            }}
        />
    }
    
    /**
     * Contains the rows of a CSS ruleset
     * @param props
     */
    mapContainer(props: ContainerProps) {
        let selectorDisplay = <span onClick={(event) => event.stopPropagation()}><TextField
            value={this.props.cssNode.selector || ""}
            displayValue={this.props.cssNode.fullSelector}
            displayClassName="css-description"
            onChange={(text) => this.props.updateSelector(this.path, text) }
        /></span>

        return (
            <div className="css-ruleset" onClick={props.onClick}>
                {selectorDisplay} {"{"}
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
        let selector = this.props.cssNode.fullSelector;
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
        const cssProperties = this.props.cssNode.properties;
        const cssSuggestions = CssSuggestions.properties;
        const genericValueSuggestions = this.props.varSuggestions || [];

        // 'initial', 'inherit', 'unset' apply to all CSS properties
        // https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax
        genericValueSuggestions.concat(['initial', 'inherit', 'unset']);
        
        return (
            <MappedTextFields value={cssProperties}
                container={(props) => this.mapContainer(props)}
                updateValue={this.props.updateProperty.bind(this, this.path)}
                deleteKey={this.props.deleteKey.bind(this, this.path)}
                keySuggestions={Array.from(cssSuggestions.keys())}
                genericValueSuggestions={genericValueSuggestions}
                valueSuggestions={cssSuggestions}
            />
        );
    }

    renderChildren() {
        return this.props.cssNode.children.map((css) => {
            return <CssEditor
                key={css.fullPath.join('-')}
                cssNode={css}
                addSelector={this.props.addSelector}
                updateName={this.props.updateName}
                updateProperty={this.props.updateProperty}
                updateDescription={this.props.updateDescription}
                updateSelector={this.props.updateSelector}
                deleteKey={this.props.deleteKey}
                deleteNode={this.props.deleteNode}
                />
        });
    }

    render() {
        const caret = this.state.isOpen ? <i className="icofont-caret-up" /> :
            <i className="icofont-caret-down" />
        
        const heading = <h2 className="css-title-heading" onClick={() => this.setState({ isOpen: !this.state.isOpen })}>
            <span className="css-title-trigger" onClick={() => this.setState({ isOpen: !this.state.isOpen })}>
                {caret}
            </span>
            {this.sectionName}
            {this.highlighter}
            <CssEditorToolbar
                cssNode={this.props.cssNode}
                addSelector={(name, selector) => this.props.addSelector(this.path, name, selector)}
                deleteNode={() => this.props.deleteNode(this.path)}
            />
        </h2>

        const content = this.state.isOpen ? <div className="css-category-content">
            {this.description}
            {this.renderProperties()}
            {this.renderChildren()}
        </div> : <></>
        
        return (
            <section className={`css-category no-print css-category-${this.path.length}`}>
                {this.renderHighlightBoxes()}
                {heading}
                {content}
            </section>
        );
    }
}