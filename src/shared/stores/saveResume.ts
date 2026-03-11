import { saveAs } from "file-saver";
import { resumeNodeStore } from "./resumeNodeStore";
import { ResumeSaveData } from "@/types";
import { stripNodeProperties } from "@/shared/utils/stripNodeProperties";
import { cssStore, rootCssStore } from "./cssStoreHooks";

export function dump(): ResumeSaveData {
    return {
        childNodes: stripNodeProperties(resumeNodeStore.data.childNodes, ['uuid']),
        builtinCss: cssStore.data.dump(),
        rootCss: rootCssStore.data.dump()
    };
}

// Save data to localStorage
export function saveLocal() {
    resumeNodeStore.clearUnsavedChanges();
    cssStore.clearUnsavedChanges();
    rootCssStore.clearUnsavedChanges();
    localStorage.setItem('experiencer', JSON.stringify(dump()));
}

// Save data to an external file
export function saveFile(filename: string) {
    saveAs(new Blob([JSON.stringify(dump())],
        { type: "text/plain;charset=utf-8" }), filename);
}