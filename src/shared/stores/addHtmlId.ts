import CssNode from "@/shared/CssTree";
import { useEditorStore } from "./editorStore";
import { resumeNodeStore } from "./resumeNodeStore";
import { useCssStore } from "./cssStore";
import { recordHistory } from "./historyStore";
import ComponentTypes from "@/resume/schema/ComponentTypes";

export default function addHtmlId(htmlId: string) {
    const selectedNodeId = useEditorStore.getState().selectedNodeId;
    const tree = resumeNodeStore.getTree();
    const css = useCssStore.getState().css;

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
    resumeNodeStore.updateNodeByUuid(selectedNodeId, 'htmlId', htmlId);
    
    useCssStore.getState().updateCss((css) => {
        css.addNode(root);
    });
}
