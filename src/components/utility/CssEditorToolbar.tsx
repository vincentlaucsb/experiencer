import React from "react";
import { Button } from "../controls/Buttons";
import CssNode from "./CssTree";
import PureMenu, { PureMenuItem } from "../controls/menus/PureMenu";
import Popover from "react-tiny-popover";
import CssSelectorAdder from "./CssSelectorAdder";

export interface CssEditorToolbarProps {
    root: CssNode;
    addSelector: (name: string, selector: string) => void;
    deleteNode: () => void;
}

const pseudoElements = [
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

export default function CssEditorToolbar(props: CssEditorToolbarProps) {
    let [pseudoMenuActive, setPseudoMenuActive] = React.useState(false);

    let deleteButton = <></>
    if (props.deleteNode && props.root.selector !== '#resume') {
        deleteButton = <Button onClick={(event) => {
            if (props.deleteNode) {
                props.deleteNode();
            }

            event.stopPropagation();
        }}><i className="icofont-ui-delete" /></Button>
    }

    let pseudoMenu = (
        <div className="pseudo-options">
            {pseudoElements.map((sel: string) => {
                if (props.root.hasName(sel)) {
                    return <></>
                }

                return (
                    <Button key={sel} onClick={(event) => {
                        props.addSelector(sel, sel);
                        event.stopPropagation();
                    }}>{sel}</Button>
                );
            })}
        </div>
    );

    let listProps = {
        // Stop parent collapsing
        onClick: (event: React.MouseEvent) => {
            event.stopPropagation();
        }
    }

    return (
        <PureMenu horizontal listProps={listProps}>
            <Popover containerClassName="pseudo-options-container"
                content={pseudoMenu} isOpen={pseudoMenuActive}>
                <Button onClick={() =>
                    setPseudoMenuActive(!pseudoMenuActive)
                }>::</Button>
            </Popover>
            <PureMenuItem>
                <CssSelectorAdder
                    addSelector={(name, selector) => props.addSelector(name, selector)}
                    selector={props.root.fullSelector}
                />
            </PureMenuItem>
            <PureMenuItem>{deleteButton}</PureMenuItem>
        </PureMenu>
    );
}