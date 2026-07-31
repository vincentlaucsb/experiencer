import React, { StrictMode } from "react";
import { render } from "@testing-library/react";

import useStylesheet from "@/shared/hooks/useStylesheet";

function StylesheetHost({ stylesheet }: { stylesheet: string }) {
    useStylesheet(stylesheet);
    return null;
}

afterEach(() => {
    document
        .querySelectorAll("style[data-resume-editor-stylesheet]")
        .forEach((style) => style.remove());
});

test("keeps exactly one current editor stylesheet through Strict Mode effect replay", () => {
    const view = render(
        <StrictMode>
            <StylesheetHost stylesheet="#resume { color: red; }" />
        </StrictMode>
    );

    let styles = document.querySelectorAll<HTMLStyleElement>(
        "style[data-resume-editor-stylesheet]"
    );
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toBe("#resume { color: red; }");

    view.rerender(
        <StrictMode>
            <StylesheetHost stylesheet="#resume { color: blue; }" />
        </StrictMode>
    );

    styles = document.querySelectorAll<HTMLStyleElement>(
        "style[data-resume-editor-stylesheet]"
    );
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toBe("#resume { color: blue; }");

    view.unmount();
    expect(document.querySelector("style[data-resume-editor-stylesheet]")).toBeNull();
});
