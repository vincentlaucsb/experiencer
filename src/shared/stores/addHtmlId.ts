import CssNode from "@/shared/CssTree";
import { useEditorStore } from "./editorStore";
import { resumeNodeStore } from "./resumeNodeStore";
import { cssStore } from "./cssStoreHooks";
import { recordHistory } from "./historyStore";
import ComponentTypes from "@/resume/schema/ComponentTypes";

export default function addHtmlId(htmlId: string) {
    const selectedNodeId = useEditorStore.getState().selectedNodeId;
    const tree = resumeNodeStore.data;
    const css = cssStore.data;

    if (!selectedNodeId) return;

    const currentNode = tree.getNodeByUuid(selectedNodeId);
    if (!currentNode) return;

    let root = new CssNode(`#${htmlId}`, {}, `#${htmlId}`);
    let copyTree = css.findNode(
        ComponentTypes.instance.cssName(currentNode.type)
    ) as CssNode;

    if (copyTree) {
        root = copyTree.copySkeleton(`#${htmlId}`, `#${htmlId}`);
    }

    recordHistory();
    resumeNodeStore.updateNode(selectedNodeId, 'htmlId', htmlId);
    
    cssStore.updateCss((css) => {
        css.addNode(root);
    });
}
