import { extractFontFamiliesFromCss, getGoogleFontsUrl } from "@/shared/utils/fonts";

export default function generateHtml(stylesheet: string, bodyHtml: string) {
    const fontFamilies = extractFontFamiliesFromCss(stylesheet);
    const googleFontsUrl = getGoogleFontsUrl(fontFamilies);
    const fontsLinkTag = googleFontsUrl
        ? `\n        <link href="${googleFontsUrl}" rel="stylesheet">`
        : '';

    return `<!doctype html>

<html lang="en">
    <head>
        <title>Resume</title>
        <meta charset="utf-8">
        <style>
            ${stylesheet}
        </style>
        ${fontsLinkTag}
    </head>
    <body style="margin: 0">
        ${bodyHtml}
    </body>
</html>
`;
}