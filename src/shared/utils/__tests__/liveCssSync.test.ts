import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import {
    countLiveCssDeclarationChanges,
    inspectLiveCssRule,
    inspectLiveCssTree
} from "@/shared/utils/liveCssSync";

function addEditorStylesheet(css: string) {
    const style = document.createElement("style");
    style.setAttribute("data-resume-editor-stylesheet", "");
    style.textContent = css;
    document.head.appendChild(style);
    return style;
}

afterEach(() => {
    document
        .querySelectorAll("style[data-resume-editor-stylesheet]")
        .forEach((style) => style.remove());
});

test("reads added, changed, removed, and important live declarations", () => {
    addEditorStylesheet(`
        #resume img {
            max-width: 80%;
            object-fit: cover !important;
        }
    `);

    const result = inspectLiveCssRule(
        "#resume img",
        new Map([
            ["max-width", "100%"],
            ["max-height", "100%"]
        ])
    );

    expect(result.status).toBe("changed");
    expect(result.declarations).toEqual(new Map([
        ["max-width", "80%"],
        ["object-fit", "cover !important"]
    ]));
    expect(result.added).toEqual(["object-fit"]);
    expect(result.changed).toEqual(["max-width"]);
    expect(result.removed).toEqual(["max-height"]);
});

test("merges matching rules in stylesheet order", () => {
    addEditorStylesheet(`
        #resume img { max-width: 100%; object-fit: contain; }
        #resume img { max-width: 75%; }
    `);

    const result = inspectLiveCssRule("#resume img", new Map());

    expect(result.declarations).toEqual(new Map([
        ["max-width", "75%"],
        ["object-fit", "contain"]
    ]));
});

test("ignores equivalent CSSOM value and selector normalization", () => {
    addEditorStylesheet(`
        #resume > img {
            color: rgb(255, 0, 0);
        }
    `);

    const result = inspectLiveCssRule(
        "#resume>img",
        new Map([["color", "#ff0000"]])
    );

    expect(result.status).toBe("unchanged");
});

test("does not fall back to computed styles when no authored rule exists", () => {
    const element = document.createElement("div");
    element.className = "computed-only";
    element.style.color = "red";
    document.body.appendChild(element);

    const result = inspectLiveCssRule(".computed-only", new Map());

    expect(result.status).toBe("not-found");
    expect(result.declarations).toEqual(new Map());
    element.remove();
});

test("finds changes throughout a CSS tree", () => {
    const root = new CssNode("Resume", { color: "black" }, "#resume");
    root.addNode("Image", { "max-width": "100%" }, "img");
    root.addNode("Header", { display: "block" }, "header");
    addEditorStylesheet(`
        #resume { color: black; }
        #resume img { max-width: 67%; object-fit: cover; }
        #resume header { display: flex; }
    `);

    const changes = inspectLiveCssTree(new ReadonlyCssNode(root));

    expect(changes.map((change) => change.name)).toEqual(["Image", "Header"]);
    expect(changes[0].path).toEqual(["Image"]);
    expect(changes[0].added).toEqual(["object-fit"]);
    expect(changes[0].changed).toEqual(["max-width"]);
    expect(changes[1].changed).toEqual(["display"]);
    expect(countLiveCssDeclarationChanges(changes)).toBe(3);
});

test("treats a deleted authored rule as removed declarations", () => {
    const root = new CssNode("Resume", {}, "#resume");
    root.addNode("Image", {
        "max-width": "100%",
        "max-height": "100%"
    }, "img");
    addEditorStylesheet("body { color: black; }");

    const changes = inspectLiveCssTree(new ReadonlyCssNode(root));

    expect(changes).toHaveLength(1);
    expect(changes[0].name).toBe("Image");
    expect(changes[0].declarations).toEqual(new Map());
    expect(changes[0].removed).toEqual(["max-width", "max-height"]);
});

test("does not report removals before the editor stylesheet exists", () => {
    const root = new CssNode("Resume", { color: "black" }, "#resume");

    expect(inspectLiveCssTree(new ReadonlyCssNode(root))).toEqual([]);
});
