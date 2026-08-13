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

test("keeps exactly one current scoped editor stylesheet through Strict Mode effect replay", () => {
    const view = render(
        <StrictMode>
            <StylesheetHost stylesheet=":root { --accent: red; } .entry { color: var(--accent); }" />
        </StrictMode>
    );

    let styles = document.querySelectorAll<HTMLStyleElement>(
        "style[data-resume-editor-stylesheet]"
    );
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toBe("#resume { --accent: red; } #resume .entry { color: var(--accent); }");

    view.rerender(
        <StrictMode>
            <StylesheetHost stylesheet=":root { --accent: blue; } .entry { color: var(--accent); }" />
        </StrictMode>
    );

    styles = document.querySelectorAll<HTMLStyleElement>(
        "style[data-resume-editor-stylesheet]"
    );
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toBe("#resume { --accent: blue; } #resume .entry { color: var(--accent); }");

    view.unmount();
    expect(document.querySelector("style[data-resume-editor-stylesheet]")).toBeNull();
});
