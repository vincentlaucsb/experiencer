import { extractFontFamiliesFromCss, getGoogleFontsUrl } from "@/shared/utils/fonts";

function escapeStylesheetForHtml(stylesheet: string) {
    // A style element is parsed as raw HTML text, so CSS backslashes do not
    // escape a literal closing tag. Use a CSS escape for every opening bracket.
    return stylesheet.replace(/</g, '\\3C ');
}

export default function generateHtml(stylesheet: string, bodyHtml: string) {
    const fontFamilies = extractFontFamiliesFromCss(stylesheet);
    const googleFontsUrl = getGoogleFontsUrl(fontFamilies);
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
