import { useLayoutEffect, useRef } from "react";

import useGoogleFontsStylesheet from "@/shared/hooks/useGoogleFontsStylesheet";
import { cssStore, rootCssStore } from "@/shared/stores/cssStoreHooks";
import {
    inspectScopedLiveCssChanges,
    liveCssBaselineStore
} from "@/shared/utils/liveCssBaseline";

/**
 * Custom hook to apply a stylesheet to the document head.
 * @param stylesheet The CSS string to be applied.
 */
export default function useStylesheet(stylesheet: string) {
    useGoogleFontsStylesheet(stylesheet);
    const styleElementRef = useRef<HTMLStyleElement | null>(null);

    useLayoutEffect(() => {
        const ret = document.createElement("style");
        ret.setAttribute("data-resume-editor-stylesheet", "");
        const head = document.getElementsByTagName("head")[0];
        styleElementRef.current = head.appendChild(ret);

        return () => {
            if (styleElementRef.current === ret) {
                styleElementRef.current = null;
            }
            liveCssBaselineStore.reset();
            ret.remove();
        };
    }, []);

    useLayoutEffect(() => {
        const styleElement = styleElementRef.current;
        if (!styleElement) return;
        styleElement.textContent = stylesheet;
        liveCssBaselineStore.capture(
            inspectScopedLiveCssChanges(cssStore.data, rootCssStore.data)
        );
    }, [stylesheet]);
}
