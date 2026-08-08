import { useEffect } from "react";

import { ensureGoogleFontsLink, extractFontFamiliesFromCss } from "@/shared/utils/fonts";
import type { GoogleFontRequest } from "@/shared/utils/fonts";
import { getGoogleFontRequests } from '@/shared/fonts/builtinFonts';

/**
 * Custom hook that loads Google Fonts referenced by a CSS stylesheet string.
 */
export default function useGoogleFontsStylesheet(
    stylesheet: string,
    options: {
        linkId?: string;
        removeOnUnmount?: boolean;
        fontFamilies?: GoogleFontRequest[];
    } = {}
) {
    const linkId = options.linkId ?? 'template-google-fonts';
    const removeOnUnmount = options.removeOnUnmount ?? false;
    const fontFamilies = options.fontFamilies;

    useEffect(() => {
        const requestedFamilies = getGoogleFontRequests(
            fontFamilies ?? extractFontFamiliesFromCss(stylesheet)
        );
        ensureGoogleFontsLink(requestedFamilies, undefined, linkId);

        return () => {
            if (removeOnUnmount) {
                document.getElementById(linkId)?.remove();
            }
        };
    }, [fontFamilies, linkId, removeOnUnmount, stylesheet]);
}
