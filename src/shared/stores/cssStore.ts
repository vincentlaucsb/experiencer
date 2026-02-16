import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import CssNode from '@/shared/utils/CssTree';
import { CssNodeDump } from '@/types';

interface CssState {
    // CSS trees
    css: CssNode;
    rootCss: CssNode;

    // Actions
    setCss: (css: CssNode) => void;
    setRootCss: (rootCss: CssNode) => void;
    updateCss: (updater: (css: CssNode) => void) => void;
    updateRootCss: (updater: (rootCss: CssNode) => void) => void;
    loadCss: (cssData: CssNodeDump, rootCssData: CssNodeDump) => void;
    reset: () => void;
}

// Default CSS trees
const createDefaultCss = () => new CssNode("Resume CSS", {}, "#resume");
const createDefaultRootCss = () => new CssNode(":root", {}, ":root");

export const useCssStore = create<CssState>()(
    devtools(
        (set, get) => ({
            // Initial state
            css: createDefaultCss(),
            rootCss: createDefaultRootCss(),

            // Set entire CSS tree
            setCss: (css: CssNode) =>
                set({ css }, false, 'setCss'),

            // Set entire root CSS tree
            setRootCss: (rootCss: CssNode) =>
                set({ rootCss }, false, 'setRootCss'),

            // Update css with a mutating function, then trigger re-render with deep copy
            updateCss: (updater: (css: CssNode) => void) =>
                set((state) => {
                    updater(state.css);
                    return { css: state.css.deepCopy() };
                }, false, 'updateCss'),

            // Update rootCss with a mutating function, then trigger re-render with deep copy
            updateRootCss: (updater: (rootCss: CssNode) => void) =>
                set((state) => {
                    updater(state.rootCss);
                    return { rootCss: state.rootCss.deepCopy() };
                }, false, 'updateRootCss'),

            // Load CSS from serialized data
            loadCss: (cssData: CssNodeDump, rootCssData: CssNodeDump) => {
                const css = CssNode.load(cssData);
                const rootCss = CssNode.load(rootCssData);
                set({ css, rootCss }, false, 'loadCss');
            },

            // Reset to default CSS trees
            reset: () =>
                set(
                    { 
                        css: createDefaultCss(),
                        rootCss: createDefaultRootCss()
                    },
                    false,
                    'reset'
                )
        }),
        { name: 'CssStore' }
    )
);

// Selectors for accessing CSS state
export const useCss = () => useCssStore((state) => state.css);
export const useRootCss = () => useCssStore((state) => state.rootCss);
export const useTreeStylesheet = () => {
    const css = useCss();
    const rootCss = useRootCss();
    return `${rootCss.stylesheet()}\n\n${css.stylesheet()}`;
};
