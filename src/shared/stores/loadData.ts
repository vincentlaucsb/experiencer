import { EditorMode, Globals, ResumeSaveData } from "@/types";
import { cssStore, rootCssStore } from "./cssStoreHooks";
import { resumeNodeStore } from "./resumeNodeStore";
import { useHistoryStore } from "./historyStore";
import { assignIds } from "../utils/assignIds";
import { workspaceStore } from "./workspaceStore";
import { useEditorStore } from "./editorStore";
import PageSize from "@/types/PageSize";
import { documentFontsStore } from './documentFontsStore';
import { extractFontFamiliesFromCss } from '@/shared/utils/fonts';
import { isBuiltinFontFamily } from '@/shared/fonts/builtinFonts';
import { normalizeLegacyResumeCssRoots } from '@/shared/resumeDocument/normalizeLegacyResumeCssRoots';

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

/** Hydrates the editor stores from serialized resume data without changing workspace state. */
export function hydrateResumeData(data: object) {
    const savedData = normalizeLegacyResumeCssRoots(data as ResumeSaveData);
    const normalizedChildNodes = normalizeLegacyNodeTypes(savedData.childNodes as any[]);
    const nodes = assignIds(normalizedChildNodes);

    resumeNodeStore.setNodes(nodes);

    // Clear history when loading new data
    useHistoryStore.getState().clear();
    
    cssStore.loadCss(savedData.builtinCss);
    rootCssStore.loadCss(savedData.rootCss);
    documentFontsStore.load(savedData.fonts ?? extractFontFamiliesFromCss(
        `${rootCssStore.getStylesheet()}\n\n${cssStore.getStylesheet()}`
    ).map((family) => ({
        provider: isBuiltinFontFamily(family) ? 'builtin' as const : 'google' as const,
        family
    })));
    useEditorStore.getState().loadPageSize(
        savedData.pageSize === PageSize.A4 ? PageSize.A4 : PageSize.Letter
    );
}

/**
 * Load resume data into the stores and enter the requested workspace mode.
 * @param data Serialized resume data to load
 * @param mode Workspace mode to enter after loading (default: 'normal')
 * @param documentId Persisted document opened by this load, when applicable
 */
export default function loadData(
    data: object,
    mode: EditorMode = 'normal',
    documentId?: string
) {
    hydrateResumeData(data);

    workspaceStore.transitionTo(mode, documentId);
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
