/**
 * @jest-environment jsdom
 */
import CssNode from "@/shared/CssTree";
import { cssStore, rootCssStore } from "@/shared/stores/cssStoreHooks";
import { useHistoryStore } from "@/shared/stores/historyStore";
import { LiveCssSyncCoordinator } from "@/shared/stores/LiveCssSyncCoordinator";
import { clearToast } from "@/shared/stores/toastStore";
import {
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
    clearToast();
    liveCssBaselineStore.reset();
    useHistoryStore.getState().clear();
    document
        .querySelectorAll("style[data-resume-editor-stylesheet]")
        .forEach((style) => style.remove());
});

test("detects and imports real root and resume edits as one undoable action", () => {
    const css = new CssNode("Resume CSS", {}, "body");
    css.addNode("Entry", { display: "block" }, ".entry");
    const rootCss = new CssNode(":root", {}, ":root");
    rootCss.addNode("Root only", { color: "red" }, ".root-only");
    cssStore.setCss(css);
    rootCssStore.setCss(rootCss);
    useHistoryStore.getState().clear();

    const style = addEditorStylesheet(`
        #resume .root-only { color: red; }
        #resume .entry { display: block; }
    `);
    liveCssBaselineStore.capture(inspectScopedLiveCssChanges(css, rootCss));
    const rootRule = style.sheet?.cssRules[0] as CSSStyleRule;
    const resumeRule = style.sheet?.cssRules[1] as CSSStyleRule;
    rootRule.style.setProperty("color", "blue");
    resumeRule.style.setProperty("display", "grid");

    const coordinator = new LiveCssSyncCoordinator();
    const disconnect = coordinator.connect();

    expect(coordinator.getSnapshot().changes.map((change) => change.tree)).toEqual([
        "root",
        "resume"
    ]);
    expect(coordinator.getSnapshot().changeCount).toBe(2);

    coordinator.importAll();
    disconnect();

    expect(rootCssStore.data.mustFindNode(["Root only"]).properties.get("color")).toBe("blue");
    expect(cssStore.data.mustFindNode(["Entry"]).properties.get("display")).toBe("grid");
    expect(useHistoryStore.getState().past).toHaveLength(1);

    useHistoryStore.getState().undo();
    expect(rootCssStore.data.mustFindNode(["Root only"]).properties.get("color")).toBe("red");
    expect(cssStore.data.mustFindNode(["Entry"]).properties.get("display")).toBe("block");
});
