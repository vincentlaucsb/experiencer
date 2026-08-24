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

function findCssRule(css: CssNode, htmlId: string) {
    return css.findNodeBySelector(`#${htmlId}`);
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
        let generalCssEditor = <></>
        let specificCssEditor = <></>
        const parentCssRules = findParentCssRules(selectedNode, css);

        const rootNode = css.findNode(
            ComponentTypes.instance.cssName(selectedNode.type)) as CssNode;

        if (rootNode) {
            generalCssEditor = <CssEditor
                key={`${selectedNode.uuid}-${rootNode.fullPath.join('-')}`}
                cssNode={new ReadonlyCssNode(rootNode)}
                isOpen={true}
                showAncestors
                additionalAncestors={parentCssRules}
                liveTree="resume"
                commands={resumeCommands}
            />
        }

        if (selectedNode.htmlId) {
            const specificRoot = findCssRule(css, selectedNode.htmlId);
            if (specificRoot) {
                specificCssEditor = <CssEditor
                    key={`${selectedNode.uuid}-#${selectedNode.htmlId}`}
                    cssNode={new ReadonlyCssNode(specificRoot)}
                    isOpen={true}
                    showAncestors
                    additionalAncestors={parentCssRules}
                    liveTree="resume"
                    commands={resumeCommands} />
            }
        }

        return <>
            {syncControls}
            {specificCssEditor}
            {generalCssEditor}
        </>
    }

    return <>
        {syncControls}
        <CssEditor
            cssNode={new ReadonlyCssNode(rootCss)}
            isOpen={true}
            liveTree="root"
            commands={rootCommands} />
        <CssEditor
            cssNode={new ReadonlyCssNode(css)}
            isOpen={true}
            liveTree="resume"
            varSuggestions={makeCssVarSuggestions(rootCss)}
            commands={resumeCommands} />
    </>
}

function ResumeCssEditorWrapper({ selectedNodeId }: ResumeCssEditorWrapperProps) {
    const { css, rootCss, updateCss, updateRootCss } = useCssStore();
    const selectedNode = useResumeNodeByUuid(selectedNodeId || '');

    return (
        <ResumeCssEditor
            css={css}
            rootCss={rootCss}
            selectedNode={selectedNode}
            updateCss={updateCss}
            updateRootCss={updateRootCss}
        />
    );
}

export default ResumeCssEditorWrapper;
