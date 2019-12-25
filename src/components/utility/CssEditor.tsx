import CssNode from "./CssTree";
import React from "react";
import MappedTextFields from "../controls/inputs/MappedTextFields";
import Collapse from "../controls/Collapse";
import { Button } from "../controls/Buttons";
import CssSelectorAdder from "./CssSelectorAdder";

export interface CssEditorProps {
    autoCollapse?: boolean;
    root: CssNode;
    addSelector: (path: string[], name: string, selector: string) => void;
    updateData: (path: string[], key: string, value: string) => void;
    deleteData: (path: string[], key: string) => void;
}

export default class CssEditor extends React.Component<CssEditorProps> {
    constructor(props) {
        super(props);

        this.mapContainer = this.mapContainer.bind(this);
    }

    /** A list of suggested CSS properties */
    static readonly cssProperties: Array<string> = [
        'align-items',
        'background',
        'border',
        'border-bottom',
        'border-left',
        'border-radius',
        'border-right',
        'border-top',
        'color',
        'content',
        'display',
        'flex-direction',
        'font-family',
        'font-size',
        'font-weight',
        'grid-column-gap',
        'grid-row-gap',
        'grid-template-columns',
        'grid-template-rows',
        'height',
        'justify-content',
        'margin',
        'margin-bottom',
        'margin-left',
        'margin-right',
        'margin-top',
        'padding',
        'padding-bottom',
        'padding-left',
        'padding-right',
        'padding-top',
        'text-align',
        'text-transform',
        'width'
    ];

    get path() {
        return this.props.root.fullPath;
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
        const hits = document.querySelectorAll(this.props.root.fullSelector);

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
        let root = <></>

        let cssRoot = this.props.root.root as CssNode;
        if (cssRoot) {
            root = (
                <div className="css-ruleset">
                    {":root{"}
                    <MappedTextFields value={cssRoot.properties}
                        container={this.mapContainer}
                        updateValue={(key: string, value: string) => {
                            cssRoot.setProperty([], key, value);
                        }}
                        deleteKey={(key: string) => {
                            cssRoot.deleteProperty([], key);
                        }} />
                    {"}"}
                </div>
            );
        }

        return (
            <>
                <div className="css-ruleset">
                    {selector} {"{"}
                    <MappedTextFields value={cssProperties}
                        container={this.mapContainer}
                        updateValue={this.props.updateData.bind(this, this.path)}
                        deleteKey={this.props.deleteData.bind(this, this.path)}
                        keySuggestions={CssEditor.cssProperties}
                    />
                    {"}"}
                </div>
                {root}
            </>
        );
    }

    renderChildren() {
        return this.props.root.children.map((css) => {
            return <CssEditor
                key={css.fullSelector}
                root={css}
                autoCollapse={this.props.autoCollapse}
                addSelector={this.props.addSelector}
                updateData={this.props.updateData}
                deleteData={this.props.deleteData}
            />
        });
    }

    render() {
        let beforeAfter = <>
            <Button onClick={(event) => {
                this.props.addSelector(this.props.root.fullPath, '::after', '::after');
                event.stopPropagation();
            }}>::after</Button>
            <Button onClick={(event) => {
                this.props.addSelector(this.props.root.fullPath, '::before', '::before');
                event.stopPropagation();
            }}>::before</Button>
            <CssSelectorAdder
                addSelector={(name, selector) => this.props.addSelector(this.props.root.fullPath, name, selector)}
                selector={this.props.root.fullSelector}
            />
        </>

        const trigger = <h2 onMouseOver={() => this.toggleHighlight()} onMouseOut={() => this.toggleHighlight(false)}>
            {this.props.root.name}
            <span className="button-group">
                {beforeAfter}
            </span>
        </h2>

        const isOpen = (this.path.length !== 1) || !this.props.autoCollapse;

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