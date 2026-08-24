import CssNode from "@/shared/CssTree";
import { showToast } from "@/shared/stores/toastStore";
import type { LiveCssTreeChange } from "@/shared/utils/liveCssSync";
import { validateAuthoredCssSelector } from "@/shared/utils/transformResumeStylesheet";

export interface CssEditorCommands {
    addSelector(path: ReadonlyArray<string>, name: string, selector: string): void;
    updateName(path: ReadonlyArray<string>, value: string): void;
    updateProperty(path: ReadonlyArray<string>, key: string, value: string): void;
    updateDescription(path: ReadonlyArray<string>, value: string): void;
    updateSelector(path: ReadonlyArray<string>, selector: string): void;
    replaceProperties(changes: ReadonlyArray<LiveCssTreeChange>): void;
    deleteKey(path: ReadonlyArray<string>, key: string): void;
    deleteNode(path: ReadonlyArray<string>): void;
}

export type CssTreeUpdater = (
    updater: (cssTreeRoot: CssNode) => void
) => void;

export type CssCommandErrorReporter = (message: string) => void;

/** Builds the complete mutation boundary used by every CSS editor view. */
export function createCssEditorCommands(
    updateTree: CssTreeUpdater,
    reportError: CssCommandErrorReporter = showToast
): CssEditorCommands {
    const acceptSelector = (selector: string): boolean => {
        try {
            validateAuthoredCssSelector(selector);
            return true;
        } catch (error) {
            reportError(error instanceof Error ? error.message : "Invalid CSS selector.");
            return false;
        }
    };

    return {
        addSelector: (path, name, selector) => {
            if (!acceptSelector(selector)) return;
            updateTree((cssTreeRoot) => {
                cssTreeRoot.mustFindNode(Array.from(path)).addNode(name, {}, selector);
            });
        },

        updateName: (path, value) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.mustFindNode(Array.from(path)).name = value;
            });
        },

        updateProperty: (path, key, value) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.setProperty(Array.from(path), key, value);
            });
        },

        updateDescription: (path, value) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.mustFindNode(Array.from(path)).description = value;
            });
        },

        updateSelector: (path, value) => {
            if (!acceptSelector(value)) return;
            updateTree((cssTreeRoot) => {
                cssTreeRoot.mustFindNode(Array.from(path)).selector = value;
            });
        },

        replaceProperties: (changes) => {
            updateTree((cssTreeRoot) => {
                for (const change of changes) {
                    cssTreeRoot
                        .mustFindNode(Array.from(change.path))
                        .setProperties(new Map(change.declarations));
                }
            });
        },

        deleteKey: (path, key) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.deleteProperty(Array.from(path), key);
            });
        },

        deleteNode: (path) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.deleteNode(Array.from(path));
            });
        }
    };
}
