import { saveAs } from "file-saver";
import { resumeNodeStore } from "./resumeNodeStore";
import { ResumeSaveData } from "@/types";
import { useCssStore } from "./cssStore";

function dump(): ResumeSaveData {
    const { css, rootCss } = useCssStore.getState();
    
    return {
        childNodes: resumeNodeStore.getTree().childNodes,
        builtinCss: css.dump(),
        rootCss: rootCss.dump()
    };
}

// Save data to localStorage
export function saveLocal() {
    resumeNodeStore.clearUnsavedChanges();
    localStorage.setItem('experiencer', JSON.stringify(dump()));
}

// Save data to an external file
export function saveFile(filename: string) {
    saveAs(new Blob([JSON.stringify(dump())],
        { type: "text/plain;charset=utf-8" }), filename);
}