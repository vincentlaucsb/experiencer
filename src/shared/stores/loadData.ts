import { EditorMode, Globals, ResumeSaveData } from "@/types";
import { useEditorStore } from "./editorStore";
import { useCssStore } from "./cssStore";
import { resumeNodeStore } from "./resumeNodeStore";
import { useHistoryStore } from "./historyStore";
import { assignIds } from "../utils/Helpers";

/**
 * Load resume data into the stores
 * @param data Serialized resume data to load
 * @param mode Editor mode to set after loading (default: 'normal')
 */
export default function loadData(data: object, mode: EditorMode = 'normal') {
    let savedData = data as ResumeSaveData;
    const nodes = assignIds(savedData.childNodes);

    resumeNodeStore.setNodes(nodes);

    // Clear history when loading new data
    useHistoryStore.getState().clear();
    
    useCssStore.getState().loadCss(savedData.builtinCss, savedData.rootCss);

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