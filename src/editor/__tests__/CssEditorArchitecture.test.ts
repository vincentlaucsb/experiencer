import * as fs from "fs";
import * as path from "path";

const cssEditorDirectory = path.join(__dirname, "..", "CssEditor");
const cssEditorSource = fs.readFileSync(path.join(cssEditorDirectory, "index.tsx"), "utf8");
const resumeCssEditorSource = fs.readFileSync(
    path.join(__dirname, "..", "..", "app", "ResumeCssEditor.tsx"),
    "utf8"
);

test("the CSS editor composition does not own global inspection or live-sync policy", () => {
    expect(cssEditorSource).not.toMatch(
        /liveCssBaseline|inspectLiveCss|toastStore|editorStore|createContainer|react-dom/
    );
});

test("recursive CSS editors receive one command surface", () => {
    expect(cssEditorSource).not.toMatch(
        /\b(addSelector|updateName|updateProperty|updateDescription|updateSelector|replaceProperties|deleteKey|deleteNode)=/
    );
    expect(cssEditorSource.match(/commands=\{props\.commands\}/g)).toHaveLength(3);
});

test("ResumeCssEditor remains a lifecycle and rendering adapter", () => {
    expect(resumeCssEditorSource).not.toMatch(
        /setInterval|clearInterval|inspectScopedLiveCssChanges|liveCssBaselineStore|applyScopedLiveCssChanges|changesSignature|useState|useCallback/
    );
    expect(resumeCssEditorSource).toContain("liveCssSyncCoordinator.connect()");
});

test("focused CSS view adapters remain present", () => {
    expect(fs.readdirSync(cssEditorDirectory).sort()).toEqual([
        "CssAncestorRules.tsx",
        "CssHighlightPortal.tsx",
        "CssPropertyEditor.tsx",
        "CssRuleEditor.tsx",
        "index.tsx"
    ]);
});
