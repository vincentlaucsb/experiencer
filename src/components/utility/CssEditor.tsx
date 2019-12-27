import CssNode from "./CssTree";
import React from "react";
import MappedTextFields, { ContainerProps } from "../controls/inputs/MappedTextFields";
import Collapse from "../controls/Collapse";
import { Button } from "../controls/Buttons";
import CssSelectorAdder from "./CssSelectorAdder";
import TextField from "../controls/inputs/TextField";
import ReactDOM from "react-dom";
import PureMenu, { PureDropdown, PureMenuItem } from "../controls/menus/PureMenu";

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

    static readonly pseudoElements = [
        '::after',
        '::before',
        ':first',
        ':first-child',
        ':first-of-type',
        ':last-child',
        ':last-of-type',
        ':only-child',
        ':only-of-type'
    ];

    /** A list of suggested CSS properties */
    get cssProperties() {
        const properties = new Map<string, Array<string>>([
            ['align-content', ['start', 'center', 'space-between', 'space-around']],
            ['align-items',
                ['normal', 'stretch', 'center', 'start', 'end', 'flex-start',
                'flex-end']
            ],
            ['background', new Array<string>()],
            ['border', new Array<string>()],
            ['border-bottom', new Array<string>()],
            ['border-left', new Array<string>()],
            ['border-radius', new Array<string>()],
            ['border-right', new Array<string>()],
            ['border-top', new Array<string>()],
            ['color', new Array<string>()],
            ['content', new Array<string>()],
            ['display', new Array<string>()],
            ['flex-basis', []],
            ['flex-direction',
                ['column', 'column-reverse', 'row', 'row-reverse']
            ],
            ['flex-flow', []],
            ['flex-grow', []],
            ['flex-shrink', []],
            ['flex-wrap', ['nowrap', 'wrap', 'wrap-reverse']],
            ['float', []],
            ['font-family', new Array<string>()],
            ['font-size',
                [
                    'xx-small', 'x-small', 'small', 'medium',
                    'large', 'x-large', 'xx-large', 'xxx-large',
                    'smaller', 'larger'
                ]
            ],
            ['font-size-adjust', ['none']],
            ['font-stretch',
                [
                    'ultra-condensed', 'extra-condensed', 'condensed',
                    'semi-condensed', 'normal', 'semi-expanded', 'expanded',
                    'extra-expanded', 'ultra-expanded'
                ]],
            ['font-style', ['normal', 'italic', 'oblique']],
            ['font-variant', []],
            ['font-weight', ['normal', 'bold', 'lighter', 'bolder']],
            ['grid-column-gap', new Array<string>()],
            ['grid-row-gap', new Array<string>()],
            ['grid-template-columns', new Array<string>()],
            ['grid-template-row', new Array<string>()],
            ['height', new Array<string>()],
            ['hyphens',
                ['none', 'manual', 'auto']],
            ['justify-content',
                ['center', 'start', 'end', 'flex-start', 'flex-end', 'left', 'right',
                'normal', 'space-between', 'space-around', 'space-evenly', 'stretch']
            ],
            ['letter-spacing', ['normal']],
            ['line-height', ['normal']],
            ['list-style', [
                'disc', 'circle', 'square', 'decimal',
                'decimal-leading-zero',
                'lower-roman', 'upper-roman', 'lower-greek',
                'lower-alpha', 'lower-latin', 'upper-alpha', 'upper-latin',
                'none'
            ]],

            // TODO: Copy values for list-style
            ['list-style-type', ['disc']],
            ['list-style-position', ['inside', 'outside']],
            ['margin', new Array<string>()],
            ['margin-bottom', new Array<string>()],
            ['margin-left', new Array<string>()],
            ['margin-right', new Array<string>()],
            ['margin-top', new Array<string>()],
            ['max-height', []],
            ['max-width', []],
            ['min-height', []],
            ['min-width', []],
            ['object-fit', ['contain', 'cover', 'fill', 'none', 'scale-down']],
            ['object-position', []],
            ['opacity', []],
            ['order', []],
            ['overflow-wrap',
                ['normal', 'anywhere', 'break-word']],
            ['padding', new Array<string>()],
            ['padding-bottom', new Array<string>()],
            ['padding-left', new Array<string>()],
            ['padding-right', new Array<string>()],
            ['padding-top', new Array<string>()],
            ['position', []],
            ['text-align',
                ['left', 'right', 'center', 'justify']],
            ['text-decoration', []],
            ['text-decoration-color', []],
            ['text-decoration-line', ['none', 'underline', 'overline', 'line-through']],
            ['text-decoration-style', ['solid', 'double', 'dotted', 'dashed', 'wavy']],
            ['text-decoration-thickness', []],
            ['text-indent', ['hanging']],
            ['text-transform',
                ['capitalize', 'uppercase', 'lowercase', 'none', 'full-width',
                'full-size-kana']],
            ['width', new Array<string>()],
            ['word-break', ['normal', 'break-all', 'keep-all']],
            ['word-spacing', ['normal']]
        ]);

        // TODO: Refactor map adding code
        // 'initial', 'inherit', 'unset' apply to all CSS properties
        // https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax
        for (let k of properties.keys()) {
            let values = properties.get(k);
            if (values) {
                values.push('initial', 'inherit', 'unset');
                properties.set(k, values);
            }
        }

        // Add var() suggestions
        for (let k of properties.keys()) {
            let values = properties.get(k);
            if (values) {
                for (let sug of this.varSuggestions) {
                    values.push(`var(${sug})`);
                }

                properties.set(k, values);
            }
        }

        /** Copy properties */
        let alignItems = properties.get('align-items');
        if (alignItems) {
            properties.set('align-self', alignItems);
        }

        return properties;
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
                    suggestions.push(k);
                }
            }
        }

        return suggestions;
    }

    get path() {
        return this.props.root.fullPath;
    }

    get toolbar() {
        let deleteButton = <></>
        if (this.props.deleteNode && this.props.root.selector !== '#resume') {
            deleteButton = <Button onClick={(event) => {
                if (this.props.deleteNode) {
                    this.props.deleteNode(this.props.root.fullPath);
                }

                event.stopPropagation();
            }}><i className="icofont-ui-delete" /></Button>
        }
        
        let pseudoMenu = (
            <PureDropdown content={<Button>::</Button>}>
                {CssEditor.pseudoElements.map((sel) => {
                    if (this.props.root.hasName(sel)) {
                        return <></>
                    }

                    return <PureMenuItem>
                          <Button onClick={(event) => {
                            this.props.addSelector(this.props.root.fullPath, sel, sel);
                            event.stopPropagation();
                          }}>{sel}</Button>
                    </PureMenuItem>
                })}
            </PureDropdown>
        );

        let listProps = {
            // Stop parent collapsing
            onClick: (event: React.MouseEvent) => {
                event.stopPropagation();
            }
        }

        return (
            <PureMenu horizontal listProps={listProps}>
                <PureMenuItem>{pseudoMenu}</PureMenuItem>
                <PureMenuItem>
                    <CssSelectorAdder
                        addSelector={(name, selector) => this.props.addSelector(this.props.root.fullPath, name, selector)}
                        selector={this.props.root.fullSelector}
                        />
                </PureMenuItem>
                <PureMenuItem>{deleteButton}</PureMenuItem>
            </PureMenu>
        );
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
                hits.forEach((node: Element) => {
                    const bounds = node.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(node);

                    let left = `calc(${bounds.left}px - ${computedStyle.marginLeft})`;
                    let top = `calc(${bounds.top}px - ${computedStyle.marginTop})`

                    elems.push(<div className="resume-hl-box"
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
                    valueSuggestions={this.cssProperties}
                />
                {root}
            </>
        );
    }

    renderChildren() {
        return this.props.root.children.map((css: CssNode) => {
            return <CssEditor
                key={css.fullSelector}
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
                this.props.updateDescription(this.props.root.fullPath, text);
            }}
        />
    }

    render() {
        const trigger = <h2 className="css-title-heading">
            <span className="css-title">
                {this.props.root.name}
            </span>
            {this.highlighter}
            {this.toolbar}    
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