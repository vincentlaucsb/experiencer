/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";

import Tabs from "@/controls/Tabs";

test("supports roving tab focus and arrow-key activation", () => {
    render(
        <Tabs>
            <div key="Tree">Tree content</div>
            <div key="CSS">CSS content</div>
            <div key="Raw CSS">Raw CSS content</div>
        </Tabs>
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs[1].getAttribute("tabindex")).toBe("-1");

    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });

    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(tabs[1].getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("tabpanel").textContent).toContain("CSS content");
});
