import React, { useState } from "react";

import TextField from "@/controls/inputs/TextField";
import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import type {
    LiveCssSyncCoordinator,
    LiveCssTreeName
} from "@/shared/stores/LiveCssSyncCoordinator";
import CssPropertyEditor from "./CssPropertyEditor";
import CssActionButton from '../CssActionButton';

const CssEditorToolbar = React.lazy(() => import("../CssEditorToolbar"));
const PARENT_RULE_TITLE = "Parent rule shown because it may affect the selected node.";

interface CssRuleEditorProps {
    commands: CssEditorCommands;
    cssNode: ReadonlyCssNode;
    highlight: boolean;
    isAncestor: boolean;
    isOpen: boolean;
    liveSync: Pick<LiveCssSyncCoordinator, "importSection">;
    liveTree: LiveCssTreeName;
    onToggleHighlight(): void;
    onToggleOpen(): void;
    getVariableSuggestions?: (rule: ReadonlyCssNode) => string[];
}

/** Binds a CSS block and its quick actions to the rule's stable tree path. */
export default function CssRuleEditor({
    commands,
    cssNode,
    highlight,
    isAncestor,
    isOpen,
    liveSync,
    liveTree,
    onToggleHighlight,
    onToggleOpen,
    getVariableSuggestions
}: CssRuleEditorProps) {
    const [showDescription, setShowDescription] = useState(false);
    const path = cssNode.fullPath;
    const selector = cssNode.fullSelector;
    const comment = cssNode.displayName.replace(/\*\//g, "* /");

    const actions = (
        <div className="css-rule-actions app-gap-1">
            {selector && selector !== ":root" && <CssActionButton
                label={`Highlight elements matching ${selector}`}
                className={highlight ? "hl hl-active" : "hl"}
                aria-pressed={highlight}
                onClick={onToggleHighlight}
            >
                <i className="icofont-binoculars" aria-hidden="true" />
            </CssActionButton>}
            <CssActionButton
                label="Rule description"
                aria-expanded={showDescription}
                onClick={() => setShowDescription(current => !current)}
            >
                <i className="icofont-ui-edit" aria-hidden="true" />
            </CssActionButton>
            <React.Suspense fallback={null}>
                <CssEditorToolbar
                    cssNode={cssNode}
                    addSelector={(name, value) => commands.addSelector(path, name, value)}
                    importLiveChanges={() => liveSync.importSection(liveTree, cssNode, commands)}
                    deleteNode={() => commands.deleteNode(path)}
                />
            </React.Suspense>
        </div>
    );

    const heading = (
        <h2 className="css-title-heading app-gap-2">
            {selector && <CssActionButton
                label={`${isOpen ? "Collapse" : "Expand"} ${cssNode.displayName} declarations`}
                className="css-title-trigger"
                aria-expanded={isOpen}
                onClick={onToggleOpen}
            >
                <i className={isOpen ? "icofont-caret-up" : "icofont-caret-down"} aria-hidden="true" />
            </CssActionButton>}
            <span className="css-rule-comment">
                {"/* "}
                <TextField plainText ariaLabel="Rule name" value={cssNode.displayName}
                    displayValue={comment} displayClassName="css-title"
                    onChange={value => commands.updateDisplayName(path, value)} />
                {" */"}
            </span>
            {isAncestor && <span className="css-parent-badge" title={PARENT_RULE_TITLE}>PARENT</span>}
        </h2>
    );

    return <>
        {selector ? heading : <div className="css-selector-row app-gap-2">{heading}{actions}</div>}
        {showDescription && <div className="app-mb-2">
            <TextField
                plainText
                ariaLabel="Rule description"
                defaultText="Add a description"
                value={cssNode.description || ""}
                onChange={text => commands.updateDescription(path, text)}
            />
        </div>}
        {selector && <div className="css-ruleset">
            <div className="css-selector-row app-gap-2">
                <span className="css-selector">
                    <TextField
                        plainText
                        ariaLabel="Selector"
                        value={cssNode.selector}
                        displayValue={selector}
                        displayClassName="css-description"
                        onChange={text => commands.updateSelector(path, text)}
                    />
                    {isOpen ? " {" : " { … }"}
                </span>
                {actions}
            </div>
            {isOpen && <CssPropertyEditor
                commands={commands}
                cssNode={cssNode}
                path={path}
                getVariables={() => getVariableSuggestions?.(cssNode) ?? []}
            />}
        </div>}
    </>;
}
