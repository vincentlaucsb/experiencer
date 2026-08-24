import { useState } from "react";

import "../CssEditor.scss";

import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import {
    liveCssSyncCoordinator,
    type LiveCssSyncCoordinator,
    type LiveCssTreeName
} from "@/shared/stores/LiveCssSyncCoordinator";
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

/** Composes the focused view adapters for one CSS subtree. */
export default function CssEditor(props: CssEditorProps) {
    const [highlight, setHighlight] = useState(false);
    const [isOpen, setIsOpen] = useState(props.isOpen || false);
    const liveSync = props.liveSync || liveCssSyncCoordinator;
    const path = props.cssNode.fullPath;

    const children = props.isAncestor ? <></> : props.cssNode.children.map((css) => (
        <CssEditor
            key={css.fullPath.join("-")}
            commands={props.commands}
            cssNode={css}
            liveSync={liveSync}
            liveTree={props.liveTree}
        />
    ));

    return (
        <section className={`css-category no-print css-category-${path.length} app-my-4`}>
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
            >
                {children}
            </CssRuleEditor>
            <CssAncestorRules
                additionalAncestors={props.additionalAncestors}
                cssNode={props.cssNode}
                visible={Boolean(props.showAncestors)}
                renderAncestor={(ancestor) => (
                    <CssEditor
                        key={`ancestor-${ancestor.fullPath.join("-")}`}
                        commands={props.commands}
                        cssNode={ancestor}
                        isAncestor
                        liveSync={liveSync}
                        liveTree={props.liveTree}
                    />
                )}
            />
        </section>
    );
}
