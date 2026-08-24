import React, { type ReactNode } from "react";

import { Button } from "@/controls/Buttons";
import TextField from "@/controls/inputs/TextField";
import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import type {
    LiveCssSyncCoordinator,
    LiveCssTreeName
} from "@/shared/stores/LiveCssSyncCoordinator";
import CssPropertyEditor from "./CssPropertyEditor";

const CssEditorToolbar = React.lazy(() => import("../CssEditorToolbar"));
const PARENT_RULE_TITLE = "Parent rule shown because it may affect the selected node.";

interface CssRuleEditorProps {
    children: ReactNode;
    commands: CssEditorCommands;
    cssNode: ReadonlyCssNode;
    highlight: boolean;
    isAncestor: boolean;
    isOpen: boolean;
    liveSync: Pick<LiveCssSyncCoordinator, "importSection">;
    liveTree: LiveCssTreeName;
    onToggleHighlight(): void;
    onToggleOpen(): void;
    varSuggestions?: Array<string>;
}

/** Renders one editable CSS rule while delegating every mutation to explicit ports. */
export default function CssRuleEditor({
    children,
    commands,
    cssNode,
    highlight,
    isAncestor,
    isOpen,
    liveSync,
    liveTree,
    onToggleHighlight,
    onToggleOpen,
    varSuggestions
}: CssRuleEditorProps) {
    const path = cssNode.fullPath;
    const isNestedCategory = path.length > 1;
    const headingSpacingClasses = isNestedCategory ? " app-my-0 app-py-2 app-px-5" : " app-my-1";
    const contentSpacingClasses = isNestedCategory ? " app-py-3 app-px-5" : "";
    const caret = isOpen
        ? <i className="icofont-caret-up" />
        : <i className="icofont-caret-down" />;
    const highlighterClassName = highlight ? "hl hl-active" : "hl";

    const sectionName = (
        <span onClick={(event) => {
            if (isOpen) event.stopPropagation();
        }}>
            <TextField
                static={!isOpen}
                defaultText="Enter a section name"
                value={cssNode.name}
                displayClassName="css-title"
                onChange={(text) => commands.updateName(path, text)}
            />
        </span>
    );

    const highlighter = cssNode.fullSelector === ":root" ? <></> : (
        <Button
            className={highlighterClassName}
            onClick={(event) => {
                onToggleHighlight();
                event.stopPropagation();
            }}
        >
            <i className="icofont-binoculars" />
        </Button>
    );

    const heading = (
        <h2 className={`css-title-heading${headingSpacingClasses}`} onClick={onToggleOpen}>
            <span className="css-title-trigger">{caret}</span>
            {sectionName}
            {isAncestor ? (
                <span className="css-parent-badge" title={PARENT_RULE_TITLE}>
                    PARENT
                </span>
            ) : <></>}
            {highlighter}
            <React.Suspense fallback={null}>
                <CssEditorToolbar
                    cssNode={cssNode}
                    addSelector={(name, selector) => commands.addSelector(path, name, selector)}
                    importLiveChanges={() => liveSync.importSection(liveTree, cssNode, commands)}
                    deleteNode={() => commands.deleteNode(path)}
                />
            </React.Suspense>
        </h2>
    );

    const content = isOpen ? (
        <div className={`css-category-content${contentSpacingClasses}`}>
            <TextField
                defaultText="No description provided"
                value={cssNode.description || ""}
                displayClassName="css-description"
                onChange={(text) => commands.updateDescription(path, text)}
            />
            <CssPropertyEditor
                commands={commands}
                cssNode={cssNode}
                path={path}
                varSuggestions={varSuggestions}
            />
            {children}
        </div>
    ) : <></>;

    return <>{heading}{content}</>;
}
