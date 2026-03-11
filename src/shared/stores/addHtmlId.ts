import CssNode from "@/shared/CssTree";
import { useEditorStore } from "./editorStore";
import { resumeNodeStore } from "./resumeNodeStore";
import { cssStore } from "./cssStoreHooks";
import { recordHistory } from "./historyStore";
import ComponentTypes from "@/resume/schema/ComponentTypes";

function sanitizeHtmlId(value: string) {
    return value.replace(/#/g, '').replace(/\s+/g, '');
}

export default function addHtmlId(htmlId: string) {
    const selectedNodeId = useEditorStore.getState().selectedNodeId;
    const tree = resumeNodeStore.data;
    const css = cssStore.data;

    if (!selectedNodeId) return;

    const currentNode = tree.getNodeByUuid(selectedNodeId);
    if (!currentNode) return;

    const nextHtmlId = sanitizeHtmlId(htmlId);
    const previousHtmlId = currentNode.htmlId;

    recordHistory();
    resumeNodeStore.updateNode(selectedNodeId, 'htmlId', nextHtmlId || undefined);
    
    cssStore.updateCss((css) => {
        let root: CssNode | undefined;

        if (previousHtmlId) {
            const previousSelector = `#${previousHtmlId}`;
            const existingNode = css.findNode([previousSelector]);
            if (existingNode) {
                root = existingNode.deepCopy();
                css.delete([previousSelector]);
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
}
