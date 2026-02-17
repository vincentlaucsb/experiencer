import React from "react";
import ReactDOM from "react-dom";
import { useEditorStore } from '@/shared/stores/editorStore';
import MappedTextFields, { ContainerProps } from "@/controls/inputs/MappedTextFields";
import TextField from "@/controls/inputs/TextField";
import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import { createContainer } from "@/shared/utils/Helpers";
import CssSuggestions from "./CssSuggestions";
import { HighlightBox } from "./HighlightBox";

// Lazy-load CssEditorToolbar since it's only shown in CSS editor sections
const CssEditorToolbar = React.lazy(() => import("./CssEditorToolbar"));

export interface CssUpdateProps {
    addSelector: (path: ReadonlyArray<string>, name: string, selector: string) => void;
    updateName: (path: ReadonlyArray<string>, value: string) => void;
    updateProperty: (path: ReadonlyArray<string>, key: string, value: string) => void;
    updateDescription: (path: ReadonlyArray<string>, data: string) => void;
    updateSelector: (path: ReadonlyArray<string>, selector: string) => void;
    deleteKey: (path: ReadonlyArray<string>, key: string) => void;
    deleteNode: (path: ReadonlyArray<string>) => void;
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
    updateTree: (updater: (cssTreeRoot: CssNode) => void) => void
): CssUpdateProps {
    return {
        addSelector: (path, name, selector) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.mustFindNode(Array.from(path)).add(name, {}, selector);
            });
        },

        updateName: (path, value) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.mustFindNode(Array.from(path)).name = value;
            });
        },

        updateProperty: (path, key, value) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.setProperty(Array.from(path), key, value);
            });
        },

        updateDescription: (path, value) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.mustFindNode(Array.from(path)).description = value;
            });
        },

        updateSelector: (path, value) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.mustFindNode(Array.from(path)).selector = value;
            });
        },

        deleteKey: (path, key) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.deleteProperty(Array.from(path), key);
            });
        },

        deleteNode: (path) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.delete(Array.from(path));
            });
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

    /** Create a button that highlights all items matching a selector */
    get highlighter() {
        let className = "hl";
        if (this.state.highlight) {
            className += " hl-active";
        }

        // Nobody needs to highlight ":root"
        if (this.props.cssNode.fullSelector === ":root") {
            return <></>
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
        return <span onClick={(event) => {
            if (this.state.isOpen) {
                event.stopPropagation();
            }
        }}>
        <TextField
            static={!this.state.isOpen}
            defaultText="Enter a section name"
            value={this.props.cssNode.name}
            displayClassName="css-title"
            onChange={(text) => {
                this.props.updateName(this.path, text);
            }}
            />
        </span>
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
        const cssHlCalcStyle = (bounds: DOMRect, computedStyle: CSSStyleDeclaration) => {
            return {
                left: `calc(${bounds.left}px - ${computedStyle.marginLeft})`,
                top: `calc(${bounds.top}px - ${computedStyle.marginTop})`,
                width: `${bounds.width}px`,
                height: `${bounds.height}px`,
                borderLeftWidth: `${computedStyle.marginLeft}`,
                borderRightWidth: `${computedStyle.marginRight}`,
                borderTopWidth: `${computedStyle.marginTop}`,
                borderBottomWidth: `${computedStyle.marginBottom}`
            }
        }

        let selector = this.props.cssNode.fullSelector;
        try {
            const hits = document.querySelectorAll(selector);
            const hlBoxContainer = createContainer("hl-box-container");
            if (hlBoxContainer && this.state.highlight) {
                const leftPaneElement = useEditorStore.getState().leftPaneElement;
                let elems = new Array<React.ReactNode>();
                hits.forEach((node: Element, key: number) => {
                    elems.push(<HighlightBox
                        key={key}
                        className="resume-hl-box"
                        elem={node}
                        leftPaneElement={leftPaneElement}
                        calcStyle={cssHlCalcStyle}
                    />)
                });

                return ReactDOM.createPortal(elems, hlBoxContainer);
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
            <MappedTextFields value={cssProperties as Map<string, string>}
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
            <span className="css-title-trigger">{caret}</span>
            {this.sectionName}
            {this.highlighter}
            <React.Suspense fallback={null}>
                <CssEditorToolbar
                    cssNode={this.props.cssNode}
                    addSelector={(name, selector) => this.props.addSelector(this.path, name, selector)}
                    deleteNode={() => this.props.deleteNode(this.path)}
                />
            </React.Suspense>
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