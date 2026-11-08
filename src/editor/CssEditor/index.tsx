import { useState } from "react";

import "../CssEditor.scss";

import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import {
    liveCssSyncCoordinator,
    type LiveCssSyncCoordinator,
    type LiveCssTreeName
} from "@/shared/stores/LiveCssSyncCoordinator";
import { localKeyboardScopeAttributes } from '@/shared/ui/localKeyboardScope';
import CssAncestorRules from "./CssAncestorRules";
import CssHighlightPortal from "./CssHighlightPortal";
import CssRuleEditor from "./CssRuleEditor";

export interface CssEditorProps {
    additionalAncestors?: ReadonlyArray<ReadonlyCssNode>;
    commands: CssEditorCommands;
    cssNode: ReadonlyCssNode;
    isAncestor?: boolean;
    isOpen?: boolean;
    liveSync?: Pick<LiveCssSyncCoordinator, "importSection">;
    liveTree: LiveCssTreeName;
    showAncestors?: boolean;
    varSuggestions?: Array<string>;
}

/** Renders each subtree in stylesheet order with full selectors on sibling rules. */
export default function CssEditor(props: CssEditorProps) {
    const [highlight, setHighlight] = useState(false);
    const [isOpen, setIsOpen] = useState(Boolean(props.isOpen));
    const liveSync = props.liveSync || liveCssSyncCoordinator;
    const path = props.cssNode.fullPath;

    return (
        <>
            <section {...localKeyboardScopeAttributes} className={`css-category no-print css-category-${path.length}${props.isAncestor ? " css-category-ancestor" : ""} app-mb-4`}>
                <CssHighlightPortal active={highlight} selector={props.cssNode.fullSelector} />
                <CssRuleEditor
                    commands={props.commands}
                    cssNode={props.cssNode}
                    highlight={highlight}
                    isAncestor={Boolean(props.isAncestor)}
                    isOpen={isOpen}
                    liveSync={liveSync}
                    liveTree={props.liveTree}
                    onToggleHighlight={() => setHighlight((current) => !current)}
                    onToggleOpen={() => setIsOpen((current) => !current)}
                    varSuggestions={props.varSuggestions}
                />
            </section>
            {!props.isAncestor && props.cssNode.children.map(css => (
                <CssEditor
                    key={JSON.stringify(css.fullPath)}
                    commands={props.commands}
                    cssNode={css}
                    isOpen
                    varSuggestions={props.varSuggestions}
                    liveSync={liveSync}
                    liveTree={props.liveTree}
                />
            ))}
            <CssAncestorRules
                additionalAncestors={props.additionalAncestors}
                cssNode={props.cssNode}
                visible={Boolean(props.showAncestors)}
                renderAncestor={(ancestor) => (
                    <CssEditor
                        key={JSON.stringify(ancestor.fullPath)}
                        commands={props.commands}
                        cssNode={ancestor}
                        isAncestor
                        varSuggestions={props.varSuggestions}
                        liveSync={liveSync}
                        liveTree={props.liveTree}
                    />
                )}
            />
        </>
    );
}
