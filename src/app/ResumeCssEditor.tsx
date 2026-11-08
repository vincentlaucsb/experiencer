import { useEffect, useSyncExternalStore } from "react";

import { useCssStore } from "@/shared/stores/cssStoreHooks";
import {
    resumeNodeStore,
    useResumeNodeByUuid
} from "@/shared/stores/resumeNodeStore";
import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import type { ResumeNode } from "@/types";
import CssEditor from "@/editor/CssEditor";
import LiveCssChangesModal from "@/editor/LiveCssChangesModal";
import { Button } from "@/controls/Buttons";
import { createCssEditorCommands } from "@/shared/stores/cssEditorCommands";
import { liveCssSyncCoordinator } from "@/shared/stores/LiveCssSyncCoordinator";

import ComponentTypes from "@/resume/schema/ComponentTypes";
import makeCssVarSuggestions from "@/shared/utils/makeCssVarSuggestions";
import findApplicableCssAncestors from "@/shared/utils/findApplicableCssAncestors";
import { useEditorStore } from "@/shared/stores/editorStore";

interface ResumeCssEditorProps {
    css: CssNode;
    rootCss: CssNode;
    selectedNode?: ResumeNode;
    updateCss: (updater: (css: CssNode) => void) => void;
    updateRootCss: (updater: (rootCss: CssNode) => void) => void;
}

interface ResumeCssEditorWrapperProps {
    selectedNodeId?: string;
}

function findParentCssRules(selectedNode: ResumeNode, css: CssNode) {
    const ancestorNodes = resumeNodeStore
        .getParentUuids(selectedNode.uuid)
        .map((uuid) => resumeNodeStore.getNodeByUuid(uuid))
        .filter((node): node is ResumeNode => Boolean(node));

    return findApplicableCssAncestors(ancestorNodes, css);
}

function ResumeCssEditor({ css, rootCss, selectedNode, updateCss, updateRootCss }: ResumeCssEditorProps) {
    const liveSync = useSyncExternalStore(
        liveCssSyncCoordinator.subscribe,
        liveCssSyncCoordinator.getSnapshot
    );
    const resumeCommands = createCssEditorCommands(updateCss);
    const rootCommands = createCssEditorCommands(updateRootCss);
    const varSuggestions = makeCssVarSuggestions(rootCss);

    useEffect(() => {
        return liveCssSyncCoordinator.connect();
    }, []);

    const syncControls = liveSync.changes.length > 0 && (
        <>
            <aside className="live-css-sync-banner" aria-label="Live CSS changes detected">
                <span>
                    <i className="icofont-warning-alt" aria-hidden="true" />
                    {liveSync.changeCount} live CSS change{liveSync.changeCount === 1 ? "" : "s"} detected
                </span>
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => liveCssSyncCoordinator.openReview()}
                >
                    <i className="icofont-refresh" aria-hidden="true" />
                    Review and import
                </Button>
            </aside>
            <LiveCssChangesModal
                changes={liveSync.changes}
                isOpen={liveSync.reviewOpen}
                onCancel={() => liveCssSyncCoordinator.closeReview()}
                onConfirm={() => liveCssSyncCoordinator.importAll()}
            />
        </>
    );

    if (selectedNode) {
        const parentCssRules = findParentCssRules(selectedNode, css);
        const componentRule = css.findNode(ComponentTypes.instance.cssName(selectedNode.type));
        const nodeRule = selectedNode.htmlId ? css.findNodeBySelector(`#${selectedNode.htmlId}`) : undefined;
        const rules = Array.from(new Set([nodeRule, componentRule]))
            .filter((rule): rule is CssNode => Boolean(rule))
            .map(rule => new ReadonlyCssNode(rule));

        return <>
            {syncControls}
            {rules.map((rule, index) => <CssEditor
                key={JSON.stringify([selectedNode.uuid, rule.fullPath])}
                cssNode={rule}
                isOpen
                showAncestors={index === rules.length - 1}
                additionalAncestors={[...(index > 0 ? rules[0].ancestors : []), ...parentCssRules]}
                liveTree="resume"
                varSuggestions={varSuggestions}
                commands={resumeCommands}
            />)}
            {rules.length === 0 && <p>No CSS rules for this node.</p>}
        </>
    }

    return <>
        {syncControls}
        <CssEditor
            cssNode={new ReadonlyCssNode(rootCss)}
            isOpen={true}
            liveTree="root"
            varSuggestions={varSuggestions}
            commands={rootCommands} />
        <CssEditor
            cssNode={new ReadonlyCssNode(css)}
            isOpen={true}
            liveTree="resume"
            varSuggestions={varSuggestions}
            commands={resumeCommands} />
    </>
}

function ResumeCssEditorWrapper({ selectedNodeId }: ResumeCssEditorWrapperProps) {
    const { css, rootCss, updateCss, updateRootCss } = useCssStore();
    const selectedNode = useResumeNodeByUuid(selectedNodeId || '');
    const showAllCss = useEditorStore(state => state.showAllCss);

    return (
        <>
            {selectedNode && <div className="css-scope app-gap-2 app-mb-4">
                <span>Selected: {selectedNode.type}{selectedNode.htmlId && ` #${selectedNode.htmlId}`}</span>
                <Button type="button" aria-pressed={showAllCss} variant={showAllCss ? 'primary' : undefined}
                    onClick={() => useEditorStore.getState().setShowAllCss(!showAllCss)}>
                    All CSS
                </Button>
            </div>}
            <ResumeCssEditor
                css={css}
                rootCss={rootCss}
                selectedNode={showAllCss ? undefined : selectedNode}
                updateCss={updateCss}
                updateRootCss={updateRootCss}
            />
        </>
    );
}

export default ResumeCssEditorWrapper;
