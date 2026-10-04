import CssNode from "@/shared/CssTree";
import { useEditorStore } from "./editorStore";
import { resumeNodeStore } from "./resumeNodeStore";
import { cssStore } from "./cssStoreHooks";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import { runHistoryTransaction } from "./historyStore";
import { getHtmlIdError } from '@/shared/utils/validateNodeCssNames';
import { showToast } from './toastStore';

export default function addHtmlId(htmlId: string) {
    const error = getHtmlIdError(htmlId);
    if (error) { showToast(error); return; }
    const selectedNodeId = useEditorStore.getState().selectedNodeId;
    const tree = resumeNodeStore.data;
    const css = cssStore.data;

    if (!selectedNodeId) return;

    const currentNode = tree.getNodeByUuid(selectedNodeId);
    if (!currentNode) return;

    const nextHtmlId = htmlId;
    const previousHtmlId = currentNode.htmlId;

    runHistoryTransaction(() => {
        resumeNodeStore.updateNode(selectedNodeId, 'htmlId', nextHtmlId || undefined);

        cssStore.updateCss((css) => {
            let root: CssNode | undefined;

            if (previousHtmlId) {
                const previousSelector = `#${previousHtmlId}`;
                const existingNode = css.findNode([previousSelector]);
                if (existingNode) {
                    root = existingNode.deepCopy();
                    css.deleteNode([previousSelector]);
                }
            }

            if (!nextHtmlId) {
                return;
            }

            const nextSelector = `#${nextHtmlId}`;
            if (root) {
                root.name = nextSelector;
                root.selector = nextSelector;
            }
            else {
                root = new CssNode(nextSelector, {}, nextSelector);
                const copyTree = css.findNode(
                    ComponentTypes.instance.cssName(currentNode.type)
                ) as CssNode;

                if (copyTree) {
                    root = copyTree.copySkeleton(nextSelector, nextSelector);
                }
            }

            css.addNode(root);
        });
    });
}
