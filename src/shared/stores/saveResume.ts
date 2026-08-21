import { saveAs } from "file-saver";
import { resumeNodeStore } from "./resumeNodeStore";
import { ResumeSaveData } from "@/types";
import { deepCopy } from "@/shared/utils/deepCopy";
import { cssStore, rootCssStore } from "./cssStoreHooks";
import { useEditorStore } from "./editorStore";
import { documentFontsStore } from './documentFontsStore';

export function dump(): ResumeSaveData {
    return {
        childNodes: deepCopy(resumeNodeStore.data.childNodes),
        builtinCss: cssStore.data.dump(),
        rootCss: rootCssStore.data.dump(),
        pageSize: useEditorStore.getState().pageSize,
        ...(documentFontsStore.data ? { fonts: documentFontsStore.data } : {})
    };
}

// Save data to localStorage
export function saveLocal() {
    resumeNodeStore.clearUnsavedChanges();
    cssStore.clearUnsavedChanges();
    rootCssStore.clearUnsavedChanges();
    documentFontsStore.clearUnsavedChanges();
    useEditorStore.getState().clearPageSizeUnsavedChanges();
    localStorage.setItem('experiencer', JSON.stringify(dump()));
}

// Save data to an external file
export function saveFile(filename: string) {
    saveAs(new Blob([JSON.stringify(dump())],
        { type: "text/plain;charset=utf-8" }), filename);
}
