import React from "react";
import { Button, Confirm } from "../controls/Buttons";
import CssNode from "./CssTree";
import PureMenu, { PureMenuItem } from "../controls/menus/PureMenu";
import Popover from "react-tiny-popover";
import CssSelectorAdder from "./CssSelectorAdder";
import { TrashIcon } from "../controls/InterfaceIcons";
import ButtonGroup from "../controls/ButtonGroup";

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
    if (props.root.selector !== '#resume') {
        deleteButton = (
            <Confirm onConfirm={() => props.deleteNode()}>
                <TrashIcon />
            </Confirm>
        );
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
    
    return (
        <ButtonGroup className="css-title-toolbar"
            onClick={(event: React.MouseEvent) => {
                // Stop parent from collapsing
                event.stopPropagation();
            }}>
            <Popover containerClassName="pseudo-options-container"
                content={pseudoMenu} isOpen={pseudoMenuActive}>
                <Button onClick={() =>
                    setPseudoMenuActive(!pseudoMenuActive)
                }>::</Button>
            </Popover>
            <CssSelectorAdder
                addSelector={(name, selector) => props.addSelector(name, selector)}
                selector={props.root.fullSelector}
            />
            {deleteButton}
        </ButtonGroup>
    );
}