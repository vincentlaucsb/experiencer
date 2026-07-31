import CssNode from "@/shared/CssTree";
import {
    createLiveCssBaseline,
    filterLiveCssChanges,
    inspectScopedLiveCssChanges,
    liveCssBaselineStore
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
    const css = new CssNode("Resume CSS", {}, "#resume");
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
    const css = new CssNode("Resume CSS", {}, "#resume");
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

test("suppresses scans until the current stylesheet baseline is ready", () => {
    const css = new CssNode("Resume CSS", { color: "black" }, "#resume");
    const rootCss = new CssNode(":root", {}, ":root");
    addEditorStylesheet("#resume { color: red; }");
    const changes = inspectScopedLiveCssChanges(css, rootCss);

    expect(liveCssBaselineStore.filter(changes)).toEqual([]);

    liveCssBaselineStore.capture(changes);
    expect(liveCssBaselineStore.filter(changes)).toEqual([]);
});
