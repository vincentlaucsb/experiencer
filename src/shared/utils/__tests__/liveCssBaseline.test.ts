import CssNode from "@/shared/CssTree";
import {
    createLiveCssBaseline,
    filterLiveCssChanges,
    inspectScopedLiveCssChanges,
    liveCssBaselineStore,
    ScopedLiveCssTreeChange
} from "@/shared/utils/liveCssBaseline";

function addEditorStylesheet(css: string) {
    const style = document.createElement("style");
    style.setAttribute("data-resume-editor-stylesheet", "");
    style.textContent = css;
    document.head.appendChild(style);
    return style;
}

afterEach(() => {
    liveCssBaselineStore.reset();
    document
        .querySelectorAll("style[data-resume-editor-stylesheet]")
        .forEach((style) => style.remove());
});

test("filters identical browser normalization noise", () => {
    const css = new CssNode("Resume CSS", {}, "body");
    css.addNode("Lists", {
        "padding-left": "var(--large-spacing)"
    }, "ul");
    const rootCss = new CssNode(":root", {}, ":root");
    addEditorStylesheet(`
        #resume ul {
            margin-top: 0;
            padding-left: var(--list-indent);
        }
    `);

    const initialChanges = inspectScopedLiveCssChanges(css, rootCss);
    const baseline = createLiveCssBaseline(initialChanges);

    expect(filterLiveCssChanges(initialChanges, baseline)).toEqual([]);
});

test("keeps a genuine edit on a noisy rule without importing baseline declarations", () => {
    const css = new CssNode("Resume CSS", {}, "body");
    css.addNode("Lists", {
        "padding-left": "var(--large-spacing)"
    }, "ul");
    const rootCss = new CssNode(":root", {}, ":root");
    const style = addEditorStylesheet(`
        #resume ul {
            margin-top: 0;
            padding-left: var(--list-indent);
        }
    `);
    const baseline = createLiveCssBaseline(
        inspectScopedLiveCssChanges(css, rootCss)
    );

    const rule = style.sheet?.cssRules[0] as CSSStyleRule;
    rule.style.setProperty("padding-left", "42px");
    const filtered = filterLiveCssChanges(
        inspectScopedLiveCssChanges(css, rootCss),
        baseline
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].added).toEqual([]);
    expect(filtered[0].changed).toEqual(["padding-left"]);
    expect(filtered[0].removed).toEqual([]);
    expect(filtered[0].declarations).toEqual(new Map([
        ["padding-left", "42px"]
    ]));
});

test("treats a blank live value as removing the declaration", () => {
    const change: ScopedLiveCssTreeChange = {
        tree: "resume",
        name: "Body",
        path: [],
        selector: "body",
        status: "changed",
        previousDeclarations: new Map([["color", "navy"], ["margin", "0"]]),
        declarations: new Map([
            ["color", ""],
            ["margin", "0"],
            ["--accent", "   "]
        ]),
        added: ["--accent"],
        changed: ["color"],
        removed: []
    };

    const filtered = filterLiveCssChanges([change], new Set());

    expect(filtered).toHaveLength(1);
    expect(filtered[0].added).toEqual([]);
    expect(filtered[0].changed).toEqual([]);
    expect(filtered[0].removed).toEqual(["color"]);
    expect(filtered[0].declarations.has("color")).toBe(false);
    expect(filtered[0].declarations.has("--accent")).toBe(false);
    expect(filtered[0].declarations.get("margin")).toBe("0");
});

test("drops a blank addition that was never declared", () => {
    const change: ScopedLiveCssTreeChange = {
        tree: "resume",
        name: "Body",
        path: [],
        selector: "body",
        status: "changed",
        previousDeclarations: new Map([["margin", "0"]]),
        declarations: new Map([["margin", "0"], ["--accent", ""]]),
        added: ["--accent"],
        changed: [],
        removed: []
    };

    expect(filterLiveCssChanges([change], new Set())).toEqual([]);
});

test("suppresses scans until the current stylesheet baseline is ready", () => {
    const css = new CssNode("Resume CSS", { color: "black" }, "body");
    const rootCss = new CssNode(":root", {}, ":root");
    addEditorStylesheet("#resume { color: red; }");
    const changes = inspectScopedLiveCssChanges(css, rootCss);

    expect(liveCssBaselineStore.filter(changes)).toEqual([]);

    liveCssBaselineStore.capture(changes);
    expect(liveCssBaselineStore.filter(changes)).toEqual([]);
});
