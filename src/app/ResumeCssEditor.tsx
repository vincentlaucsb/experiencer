import { useCss, useCssStore, useRootCss } from "@/shared/stores/cssStore";
import { useSelectedNodeId } from "@/shared/stores/editorStore";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import type { ResumeNode } from "@/types";
import CssEditor, { makeCssEditorProps } from "@/editor/CssEditor";

import { useMemo } from "react";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import makeCssVarSuggestions from "@/shared/utils/makeCssVarSuggestions";

interface ResumeCssEditorProps {
    css: CssNode;
    rootCss: CssNode;
    selectedNode?: ResumeNode;
    updateCss: (updater: (css: CssNode) => void) => void;
    updateRootCss: (updater: (rootCss: CssNode) => void) => void;
}

function ResumeCssEditor({ css, rootCss, selectedNode, updateCss, updateRootCss }: ResumeCssEditorProps) {
    if (selectedNode) {
        let generalCssEditor = <></>
        let specificCssEditor = <></>

        const rootNode = css.findNode(
            ComponentTypes.instance.cssName(selectedNode.type)) as CssNode;
        if (rootNode) {
            generalCssEditor = <CssEditor
                cssNode={new ReadonlyCssNode(rootNode)}
                isOpen={true}
                {...makeCssEditorProps(updateCss)}
            />
        }

        if (selectedNode.htmlId && css.findNode([`#${selectedNode.htmlId}`])) {
            const specificRoot = css.findNode([`#${selectedNode.htmlId}`]) as CssNode;
            specificCssEditor = <CssEditor cssNode={new ReadonlyCssNode(specificRoot)}
                isOpen={true}
                {...makeCssEditorProps(updateCss)} />
        }

        return <>
            {specificCssEditor}
            {generalCssEditor}
        </>
    }

    return <>
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

function ResumeCssEditorWrapper() {
    const { css, rootCss, updateCss, updateRootCss } = useCssStore();
    const selectedNodeId = useSelectedNodeId();

    const selectedNode = useMemo(() => {
        return selectedNodeId ? resumeNodeStore.getNodeByUuid(selectedNodeId) : undefined;
    }, [selectedNodeId]);

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
