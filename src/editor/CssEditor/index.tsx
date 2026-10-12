import { useEffect, useRef, useState } from "react";

import "../CssEditor.scss";

import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import {
    liveCssSyncCoordinator,
    type LiveCssSyncCoordinator,
    type LiveCssTreeName
} from "@/shared/stores/LiveCssSyncCoordinator";
import { focusInspectedCssRule } from '@/shared/utils/cssRuleInspection';
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
    expandedPath?: ReadonlyArray<string>;
    liveSync?: Pick<LiveCssSyncCoordinator, "importSection">;
    liveTree: LiveCssTreeName;
    showAncestors?: boolean;
    varSuggestions?: Array<string>;
}

/** Composes the focused view adapters for one CSS subtree. */
export default function CssEditor(props: CssEditorProps) {
    const [highlight, setHighlight] = useState(false);
    const [isOpen, setIsOpen] = useState(Boolean(props.isOpen) || Boolean(
        props.expandedPath && props.cssNode.fullPath.every((name, index) => props.expandedPath![index] === name)
    ));
    const liveSync = props.liveSync || liveCssSyncCoordinator;
    const path = props.cssNode.fullPath;
    const pathKey = JSON.stringify(path);
    const sectionRef = useRef<HTMLElement>(null);
    useEffect(() => {
        focusInspectedCssRule(sectionRef.current, pathKey, props.expandedPath);
    }, [pathKey, props.expandedPath]);

    const children = props.isAncestor ? <></> : props.cssNode.children.map((css) => (
        <CssEditor
            key={css.fullPath.join("-")}
            commands={props.commands}
            cssNode={css}
            expandedPath={props.expandedPath}
            varSuggestions={props.varSuggestions}
            liveSync={liveSync}
            liveTree={props.liveTree}
        />
    ));

    return (
        <section {...localKeyboardScopeAttributes} ref={sectionRef} tabIndex={props.expandedPath ? -1 : undefined} className={`css-category no-print css-category-${path.length}${props.isAncestor ? " css-category-ancestor" : ""} app-my-4`}>
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
