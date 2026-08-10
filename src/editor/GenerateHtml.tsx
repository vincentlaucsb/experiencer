import { extractFontFamiliesFromCss, getGoogleFontsUrl } from "@/shared/utils/fonts";
import { getBuiltinFontStylesheet, getGoogleFontRequests } from '@/shared/fonts/builtinFonts';

import type { GoogleFontRequest } from "@/shared/utils/fonts";
import type { ResumeFont } from '@/types';

function escapeStylesheetForHtml(stylesheet: string) {
    // A style element is parsed as raw HTML text, so CSS backslashes do not
    // escape a literal closing tag. Use a CSS escape for every opening bracket.
    return stylesheet.replace(/</g, '\\3C ');
}

export default function generateHtml(
    stylesheet: string,
    bodyHtml: string,
    requestedFontFamilies?: GoogleFontRequest[],
    bundledFontStylesheet?: string
) {
    const fontFamilies = requestedFontFamilies ?? extractFontFamiliesFromCss(stylesheet);
    const googleFontsUrl = bundledFontStylesheet === undefined
        ? getGoogleFontsUrl(getGoogleFontRequests(fontFamilies))
        : '';
    const builtinStylesheet = bundledFontStylesheet ?? getBuiltinFontStylesheet(
        fontFamilies.filter((font): font is ResumeFont => typeof font !== 'string')
    );
    const safeStylesheet = escapeStylesheetForHtml(stylesheet);
    const fontsLinkTag = googleFontsUrl
        ? `\n        <link href="${googleFontsUrl}" rel="stylesheet">`
        : '';

    return `<!doctype html>

<html lang="en">
    <head>
        <title>Resume</title>
        <meta charset="utf-8">
        <style>
            ${builtinStylesheet}
            ${safeStylesheet}
        </style>
        ${fontsLinkTag}
    </head>
    <body style="margin: 0">
        ${bodyHtml}
    </body>
</html>
`;
}
