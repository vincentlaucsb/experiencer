import { useCallback, useEffect, useState } from "react";

import { useCssStore } from "@/shared/stores/cssStoreHooks";
import { useResumeNodeByUuid } from "@/shared/stores/resumeNodeStore";
import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import type { ResumeNode } from "@/types";
import CssEditor, { makeCssEditorProps } from "@/editor/CssEditor";
import LiveCssChangesModal from "@/editor/LiveCssChangesModal";
import { Button } from "@/controls/Buttons";
import { showToast } from "@/shared/stores/toastStore";
import {
    countLiveCssDeclarationChanges,
    inspectLiveCssTree,
    LiveCssTreeChange
} from "@/shared/utils/liveCssSync";

import ComponentTypes from "@/resume/schema/ComponentTypes";
import makeCssVarSuggestions from "@/shared/utils/makeCssVarSuggestions";

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

interface PendingLiveCssChange extends LiveCssTreeChange {
    tree: "resume" | "root";
}

function getLiveChanges(css: CssNode, rootCss: CssNode) {
    const rootChanges = inspectLiveCssTree(new ReadonlyCssNode(rootCss))
        .map((change): PendingLiveCssChange => ({ ...change, tree: "root" }));
    const resumeChanges = inspectLiveCssTree(new ReadonlyCssNode(css))
        .map((change): PendingLiveCssChange => ({ ...change, tree: "resume" }));

    return [...rootChanges, ...resumeChanges];
}

function changesSignature(changes: ReadonlyArray<PendingLiveCssChange>) {
    return JSON.stringify(changes.map((change) => ({
        tree: change.tree,
        path: change.path,
        declarations: Array.from(change.declarations.entries())
    })));
}

function ResumeCssEditor({ css, rootCss, selectedNode, updateCss, updateRootCss }: ResumeCssEditorProps) {
    const [liveChanges, setLiveChanges] = useState<ReadonlyArray<PendingLiveCssChange>>([]);
    const [reviewChanges, setReviewChanges] = useState(false);
    const liveChangeCount = countLiveCssDeclarationChanges(liveChanges);

    const detectLiveChanges = useCallback(() => {
        const nextChanges = getLiveChanges(css, rootCss);
        setLiveChanges((currentChanges) => (
            changesSignature(currentChanges) === changesSignature(nextChanges)
                ? currentChanges
                : nextChanges
        ));
    }, [css, rootCss]);

    useEffect(() => {
        detectLiveChanges();
        const interval = window.setInterval(detectLiveChanges, 1000);
        return () => window.clearInterval(interval);
    }, [detectLiveChanges]);

    const importAllLiveChanges = () => {
        const rootChanges = liveChanges.filter((change) => change.tree === "root");
        const resumeChanges = liveChanges.filter((change) => change.tree === "resume");

        if (rootChanges.length > 0) {
            updateRootCss((root) => {
                for (const change of rootChanges) {
                    root.mustFindNode(Array.from(change.path))
                        .setProperties(new Map(change.declarations));
                }
            });
        }

        if (resumeChanges.length > 0) {
            updateCss((root) => {
                for (const change of resumeChanges) {
                    root.mustFindNode(Array.from(change.path))
                        .setProperties(new Map(change.declarations));
                }
            });
        }

        setReviewChanges(false);
        setLiveChanges([]);
        showToast(`Imported ${liveChangeCount} live CSS change${liveChangeCount === 1 ? "" : "s"}.`);
    };

    const syncControls = liveChanges.length > 0 && (
        <>
            <aside className="live-css-sync-banner" aria-label="Live CSS changes detected">
                <span>
                    <i className="icofont-warning-alt" aria-hidden="true" />
                    {liveChangeCount} live CSS change{liveChangeCount === 1 ? "" : "s"} detected
                </span>
                <Button
                    type="button"
                    primary
                    onClick={() => setReviewChanges(true)}
                >
                    <i className="icofont-refresh" aria-hidden="true" />
                    Review and import
                </Button>
            </aside>
            <LiveCssChangesModal
                changes={liveChanges}
                isOpen={reviewChanges}
                onCancel={() => setReviewChanges(false)}
                onConfirm={importAllLiveChanges}
            />
        </>
    );

    if (selectedNode) {
        let generalCssEditor = <></>
        let specificCssEditor = <></>

        const rootNode = css.findNode(
            ComponentTypes.instance.cssName(selectedNode.type)) as CssNode;

        if (rootNode) {
            generalCssEditor = <CssEditor
                key={`${selectedNode.uuid}-${rootNode.fullPath.join('-')}`}
                cssNode={new ReadonlyCssNode(rootNode)}
                isOpen={true}
                {...makeCssEditorProps(updateCss)}
            />
        }

        if (selectedNode.htmlId && css.findNode([`#${selectedNode.htmlId}`])) {
            const specificRoot = css.findNode([`#${selectedNode.htmlId}`]) as CssNode;
            specificCssEditor = <CssEditor
                key={`${selectedNode.uuid}-#${selectedNode.htmlId}`}
                cssNode={new ReadonlyCssNode(specificRoot)}
                isOpen={true}
                {...makeCssEditorProps(updateCss)} />
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
            {...makeCssEditorProps(updateRootCss)} />
        <CssEditor
            cssNode={new ReadonlyCssNode(css)}
            isOpen={true}
            varSuggestions={makeCssVarSuggestions(rootCss)}
            {...makeCssEditorProps(updateCss)} />
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
