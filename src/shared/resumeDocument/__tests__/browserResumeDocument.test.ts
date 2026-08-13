import {
    isolateResumeDocumentHead,
    RESUME_BUILTIN_FONTS_ID,
    RESUME_GOOGLE_FONTS_ID,
    RESUME_STYLESHEET_ID
} from '@/shared/resumeDocument/browserResumeDocument';

test('isolates standalone documents from host stylesheets', () => {
    document.head.innerHTML = `
        <style id="${RESUME_STYLESHEET_ID}">body { color: black; }</style>
        <style id="${RESUME_BUILTIN_FONTS_ID}">@font-face { font-family: Test; }</style>
        <link id="${RESUME_GOOGLE_FONTS_ID}" rel="stylesheet" href="https://fonts.example/test.css">
        <style id="preview-infrastructure">@page { margin: 0; }</style>
        <style id="application-styles">.pure-button { color: red; }</style>
        <link id="application-bundle" rel="stylesheet" href="/app.css">
    `;

    isolateResumeDocumentHead(document, ['preview-infrastructure']);

    expect(Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((element) => element.id)).toEqual([
        RESUME_STYLESHEET_ID,
        RESUME_BUILTIN_FONTS_ID,
        RESUME_GOOGLE_FONTS_ID,
        'preview-infrastructure'
    ]);
});
