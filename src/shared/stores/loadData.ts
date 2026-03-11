import { EditorMode, Globals, ResumeSaveData } from "@/types";
import { useEditorStore } from "./editorStore";
import { cssStore, rootCssStore } from "./cssStoreHooks";
import { resumeNodeStore } from "./resumeNodeStore";
import { useHistoryStore } from "./historyStore";
import { assignIds } from "../utils/assignIds";

function normalizeLegacyNodeTypes(nodes: any[] | undefined): any[] {
    if (!nodes) {
        return [];
    }

    return nodes.map((node) => {
        const childNodes = normalizeLegacyNodeTypes(node.childNodes);
        const type = node.type === 'Divider' ? 'Group' : node.type;

        return {
            ...node,
            type,
            childNodes
        };
    });
}

/**
 * Load resume data into the stores
 * @param data Serialized resume data to load
 * @param mode Editor mode to set after loading (default: 'normal')
 */
export default function loadData(data: object, mode: EditorMode = 'normal') {
    let savedData = data as ResumeSaveData;
    const normalizedChildNodes = normalizeLegacyNodeTypes(savedData.childNodes as any[]);
    const nodes = assignIds(normalizedChildNodes);

    resumeNodeStore.setNodes(nodes);

    // Clear history when loading new data
    useHistoryStore.getState().clear();
    
    cssStore.loadCss(savedData.builtinCss);
    rootCssStore.loadCss(savedData.rootCss);

    useEditorStore.getState().setMode(mode);
}

export function loadLocal() {
    const savedData = localStorage.getItem(Globals.localStorageKey);
    if (savedData) {
        try {
            loadData(JSON.parse(savedData));
        }
        catch {
            // TODO: Show an error message
            console.log("Nope, that didn't work.");
        }
    }
}