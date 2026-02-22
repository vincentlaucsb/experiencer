import { useSyncExternalStore } from 'react';
import CssStore from './CssStore';
import CssNode from '@/shared/CssTree';
import { CssNodeDump } from '@/types';

// Default CSS trees
const createDefaultCss = () => new CssNode("Resume CSS", {}, "#resume");
const createDefaultRootCss = () => new CssNode(":root", {}, ":root");

// Singleton instances
export const cssStore = new CssStore(createDefaultCss());
export const rootCssStore = new CssStore(createDefaultRootCss());

/**
 * Hook to access the main CSS tree.
 * Re-renders when CSS tree changes.
 */
export const useCss = (): CssNode => {
    const snapshot = useSyncExternalStore(
        cssStore.subscribe,
        () => cssStore.getSnapshot()
    );
    return snapshot.data;
};

/**
 * Hook to access the root CSS tree.
 * Re-renders when root CSS tree changes.
 */
export const useRootCss = (): CssNode => {
    const snapshot = useSyncExternalStore(
        rootCssStore.subscribe,
        () => rootCssStore.getSnapshot()
    );
    return snapshot.data;
};

/**
 * Hook to get combined stylesheet string.
 * Re-renders when either CSS tree changes.
 */
export const useTreeStylesheet = (): string => {
    const css = useCss();
    const rootCss = useRootCss();
    return `${rootCss.stylesheet()}\n\n${css.stylesheet()}`;
};

/**
 * Hook to check if there are unsaved CSS changes.
 * Re-renders when either CSS store changes.
 */
export const useHasUnsavedChanges = (): boolean => {
    // Subscribe to both stores to trigger re-renders
    useSyncExternalStore(
        cssStore.subscribe,
        () => cssStore.getSnapshot()
    );
    useSyncExternalStore(
        rootCssStore.subscribe,
        () => rootCssStore.getSnapshot()
    );
    return cssStore.hasUnsavedChanges() || rootCssStore.hasUnsavedChanges();
};

/**
 * Combined store actions for backwards compatibility.
 * Exposes both css and rootCss operations.
 */
export const useCssStore = () => {
    const css = useCss();
    const rootCss = useRootCss();
    
    return {
        css,
        rootCss,
        setCss: (newCss: CssNode) => cssStore.setCss(newCss),
        setRootCss: (newRootCss: CssNode) => rootCssStore.setCss(newRootCss),
        updateCss: (updater: (css: CssNode) => void) => cssStore.updateCss(updater),
        updateRootCss: (updater: (rootCss: CssNode) => void) => rootCssStore.updateCss(updater),
        loadCss: (cssData: CssNodeDump, rootCssData: CssNodeDump) => {
            cssStore.loadCss(cssData);
            rootCssStore.loadCss(rootCssData);
        },
        reset: () => {
            cssStore.setCss(createDefaultCss());
            rootCssStore.setCss(createDefaultRootCss());
        },
        hasUnsavedChanges: () => cssStore.hasUnsavedChanges() || rootCssStore.hasUnsavedChanges(),
        clearUnsavedChanges: () => {
            cssStore.clearUnsavedChanges();
            rootCssStore.clearUnsavedChanges();
        }
    };
};
