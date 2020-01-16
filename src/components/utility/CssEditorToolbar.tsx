import React from "react";
import { Button, Confirm } from "../controls/Buttons";
import { ReadonlyCssNode } from "./CssTree";
import Popover from "react-tiny-popover";
import { TrashIcon, AddIcon } from "../controls/InterfaceIcons";
import ButtonGroup from "../controls/ButtonGroup";

export interface CssEditorToolbarProps {
    cssNode: ReadonlyCssNode;
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

/**
 * Right-hand toolbar for CSS editor sections
 * @param props
 */
export default function CssEditorToolbar(props: CssEditorToolbarProps) {
    let [pseudoMenuActive, setPseudoMenuActive] = React.useState(false);
    const newSectionName = `${props.cssNode.name} Ruleset #${props.cssNode.children.length}`;

    // Don't show delete button for root nodes
    let deleteButton = (props.cssNode.isRoot) ?
        <></> : (
            <Confirm onConfirm={() => props.deleteNode()}>
                <TrashIcon />
            </Confirm>
        );

    let pseudoMenu = (
        <div className="pseudo-options">
            {pseudoElements.map((sel: string) => {
                if (props.cssNode.hasName(sel)) {
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
            <Button onClick={() => props.addSelector(newSectionName, "#some-id.some-class")}>
                <AddIcon />
            </Button>
            {deleteButton}
        </ButtonGroup>
    );
}