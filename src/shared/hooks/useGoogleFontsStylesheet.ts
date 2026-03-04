import { useEffect } from "react";

import { ensureGoogleFontsLink, extractFontFamiliesFromCss } from "@/shared/utils/fonts";

/**
 * Custom hook that loads Google Fonts referenced by a CSS stylesheet string.
 */
export default function useGoogleFontsStylesheet(stylesheet: string) {
    useEffect(() => {
        const fontFamilies = extractFontFamiliesFromCss(stylesheet);
        ensureGoogleFontsLink(fontFamilies);
    }, [stylesheet]);
}
