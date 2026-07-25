import { useEffect } from "react";

import { ensureGoogleFontsLink, extractFontFamiliesFromCss } from "@/shared/utils/fonts";

/**
 * Custom hook that loads Google Fonts referenced by a CSS stylesheet string.
 */
export default function useGoogleFontsStylesheet(
    stylesheet: string,
    options: {
        linkId?: string;
        removeOnUnmount?: boolean;
    } = {}
) {
    const linkId = options.linkId ?? 'template-google-fonts';
    const removeOnUnmount = options.removeOnUnmount ?? false;

    useEffect(() => {
        const fontFamilies = extractFontFamiliesFromCss(stylesheet);
        ensureGoogleFontsLink(fontFamilies, undefined, linkId);

        return () => {
            if (removeOnUnmount) {
                document.getElementById(linkId)?.remove();
            }
        };
    }, [linkId, removeOnUnmount, stylesheet]);
}
