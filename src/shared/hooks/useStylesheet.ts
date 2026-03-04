import { useEffect, useMemo } from "react";

import useGoogleFontsStylesheet from "@/shared/hooks/useGoogleFontsStylesheet";

/**
 * Custom hook to apply a stylesheet to the document head.
 * @param stylesheet The CSS string to be applied.
 */
export default function useStylesheet(stylesheet: string) {
    useGoogleFontsStylesheet(stylesheet);

    const styleElement = useMemo(() => {
        const ret = document.createElement("style");
        const head = document.getElementsByTagName("head")[0];
        return head.appendChild(ret);
    }, []);
    
    useEffect(() => {
        if (!styleElement) return;
        styleElement.textContent = stylesheet;
    }, [styleElement, stylesheet]);
}