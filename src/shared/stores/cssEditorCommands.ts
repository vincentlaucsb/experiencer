import CssNode from "@/shared/CssTree";
import { showToast } from "@/shared/stores/toastStore";
import type { LiveCssTreeChange } from "@/shared/utils/liveCssSync";
import { getCssDeclarationError, validateAuthoredCssSelector } from "@/shared/utils/transformResumeStylesheet";

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

/** Blank values are removals. Chromium's inspector and CSSOM setProperty drop them. */
export function withoutBlankDeclarations(declarations: ReadonlyMap<string, string>): Map<string, string> {
    return new Map(Array.from(declarations).filter(([, value]) => value.trim()));
}

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

    const removeProperty = (path: ReadonlyArray<string>, key: string) => {
        updateTree((cssTreeRoot) => {
            cssTreeRoot.deleteProperty(Array.from(path), key);
        });
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
            if (!value.trim()) {
                removeProperty(path, key);
                return;
            }
            const error = getCssDeclarationError(key, value);
            if (error) { reportError(error); return; }
            updateTree((cssTreeRoot) => {
                const node = cssTreeRoot.mustFindNode(Array.from(path));
                if (!node.selector && node.isRoot) {
                    reportError("This CSS group has no selector. Edit a child rule instead.");
                    return;
                }
                node.properties.set(key, value);
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
                const node = cssTreeRoot.mustFindNode(Array.from(path));
                if (!node.selector && node.isRoot) {
                    reportError("The selectorless CSS root groups child rules and cannot be changed.");
                    return;
                }
                node.selector = value;
            });
        },

        replaceProperties: (changes) => {
            // Validate the whole replacement before committing any rule or undo entry.
            for (const change of changes) {
                for (const [key, value] of withoutBlankDeclarations(change.declarations)) {
                    const error = getCssDeclarationError(key, value);
                    if (error) { reportError(error); return; }
                }
            }
            updateTree((cssTreeRoot) => {
                for (const change of changes) {
                    const node = cssTreeRoot.mustFindNode(Array.from(change.path));
                    if (!node.selector && node.isRoot) continue;
                    node.setProperties(withoutBlankDeclarations(change.declarations));
                }
            });
        },

        deleteKey: (path, key) => {
            removeProperty(path, key);
        },

        deleteNode: (path) => {
            updateTree((cssTreeRoot) => {
                cssTreeRoot.deleteNode(Array.from(path));
            });
        }
    };
}
