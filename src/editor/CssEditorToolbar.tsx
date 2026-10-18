import React from "react";
import { Button } from "@/controls/Buttons";
import CssActionButton from './CssActionButton';
import { ReadonlyCssNode } from "@/shared/CssTree";
import { Popover } from "react-tiny-popover";
import { TrashIcon, AddIcon } from "@/controls/InterfaceIcons";
import ButtonGroup from "@/controls/ButtonGroup";

export interface CssEditorToolbarProps {
    cssNode: ReadonlyCssNode;
    addSelector: (name: string, selector: string) => void;
    importLiveChanges: () => void;
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
    const [deletePrompt, setDeletePrompt] = React.useState(false);
    const newSectionName = `${props.cssNode.name} Ruleset #${props.cssNode.children.length}`;

    // Don't show delete button for root nodes
    let deleteButton = (props.cssNode.isRoot) ?
        <></> : (
            deletePrompt ? <>
                <CssActionButton label={`Confirm delete ${props.cssNode.name} rule`} variant="error" onClick={props.deleteNode}>
                    <i className="icofont-ui-check" aria-hidden="true" />
                </CssActionButton>
                <CssActionButton label="Cancel deleting rule" onClick={() => setDeletePrompt(false)}>
                    <i className="icofont-ui-close" aria-hidden="true" />
                </CssActionButton>
            </> : <CssActionButton label={`Delete ${props.cssNode.name} rule`} variant="error" appearance="outline" onClick={() => setDeletePrompt(true)}>
                <TrashIcon />
            </CssActionButton>
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
            aria-label="CSS rule actions"
            onClick={(event: React.MouseEvent) => {
                // Stop parent from collapsing
                event.stopPropagation();
            }}>
            {props.cssNode.fullSelector && <Popover containerClassName="pseudo-options-container"
                content={pseudoMenu} isOpen={pseudoMenuActive}>
                <CssActionButton label={`Add pseudo-class or pseudo-element to ${props.cssNode.name}`} aria-expanded={pseudoMenuActive} onClick={() =>
                    setPseudoMenuActive(!pseudoMenuActive)
                }><span aria-hidden="true">::</span></CssActionButton>
            </Popover>}
            <CssActionButton
                label="Import live changes"
                onClick={props.importLiveChanges}
            >
                <i className="icofont-refresh" aria-hidden="true" />
            </CssActionButton>
            <CssActionButton label={`Add nested rule to ${props.cssNode.name}`} onClick={() => props.addSelector(newSectionName, "#some-id.some-class")}>
                <AddIcon />
            </CssActionButton>
            {deleteButton}
        </ButtonGroup>
    );
}
