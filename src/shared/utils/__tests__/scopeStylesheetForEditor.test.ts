import scopeStylesheetForEditor, {
    scopeCssSelectorForEditor,
    scopeStylesheetForStandaloneResume
} from "@/shared/utils/scopeStylesheetForEditor";

test("maps :root and scopes ordinary selectors to #resume", () => {
    expect(scopeStylesheetForEditor(`
        :root { --accent: red; }
        .entry, .entry a:hover { color: var(--accent); }
        #resume, #resume * { box-sizing: border-box; }
    `)).toBe(`
        #resume { --accent: red; }
        #resume .entry, #resume .entry a:hover { color: var(--accent); }
        #resume, #resume * { box-sizing: border-box; }
    `);
});

test("scopes every selector in a comma-separated selector list", () => {
    expect(scopeStylesheetForEditor(`.class1, .class2 { color: red; }`))
        .toBe(`#resume .class1, #resume .class2 { color: red; }`);
});

test("recursively scopes conditional rules without changing declaration at-rules", () => {
    expect(scopeStylesheetForEditor(`
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

test("does not double-scope existing resume selectors", () => {
    expect(scopeCssSelectorForEditor("#resume .entry")).toBe("#resume .entry");
    expect(scopeCssSelectorForEditor("#resume-pro .entry")).toBe("#resume #resume-pro .entry");
});

test("maps a standalone document root to the editor container", () => {
    expect(scopeStylesheetForEditor(`body, body * { box-sizing: border-box; }`))
        .toBe(`#resume, #resume * { box-sizing: border-box; }`);
});

test("maps legacy #resume selectors to body for standalone output", () => {
    expect(scopeStylesheetForStandaloneResume(`
        #resume, #resume * { box-sizing: border-box; }
        @media print { #resume .entry { break-inside: avoid; } }
    `)).toBe(`
        body, body * { box-sizing: border-box; }
        @media print { body .entry { break-inside: avoid; } }
    `);
});
