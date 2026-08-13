import {
    scopeCssSelectorForEditor,
    scopeResumeStylesheetToEditor,
    validateAuthoredResumeStylesheet
} from '@/shared/utils/transformResumeStylesheet';

test('maps document roots and scopes every selector in a selector list', () => {
    expect(scopeResumeStylesheetToEditor(`
        :root { --accent: red; }
        html body { box-sizing: border-box; }
        body > .entry, .entry a:hover { color: var(--accent); }
    `)).toBe(`
        #resume { --accent: red; }
        #resume { box-sizing: border-box; }
        #resume>.entry,#resume .entry a:hover { color: var(--accent); }
    `);
});

test('uses a selector AST for commas inside functional selectors', () => {
    expect(scopeCssSelectorForEditor('.entry:is(.first, .last), a[href*=","]'))
        .toBe('#resume .entry:is(.first,.last),#resume a[href*=","]');
});

test('recursively scopes conditional rules without changing keyframes or declaration at-rules', () => {
    expect(scopeResumeStylesheetToEditor(`
        @media print {
            .entry { color: black; }
        }
        @font-face {
            font-family: Example;
            src: url("example.woff2");
        }
        @keyframes fade {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `)).toBe(`
        @media print {
            #resume .entry { color: black; }
        }
        @font-face {
            font-family: Example;
            src: url("example.woff2");
        }
        @keyframes fade {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `);
});

test('preserves comments while transforming parsed CSS', () => {
    expect(scopeResumeStylesheetToEditor('/* root */\n.entry { color: red; }'))
        .toBe('/* root */\n#resume .entry { color: red; }');
});

test('rejects the editor-only host in authored CSS', () => {
    expect(() => validateAuthoredResumeStylesheet('#resume .entry { color: red; }'))
        .toThrow('#resume is reserved');
    expect(() => scopeResumeStylesheetToEditor('#resume .entry { color: red; }'))
        .toThrow('#resume is reserved');
});

test('rejects invalid authored CSS instead of partially transforming it', () => {
    expect(() => scopeResumeStylesheetToEditor('.entry { color: red;'))
        .toThrow();
});
