/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from "@testing-library/react";

import Dropdown from "@/controls/menus/Dropdown";

describe("Dropdown", () => {
    test("toggles active class on trigger click", () => {
        const { container, getByText } = render(
            <Dropdown trigger={<button type="button">Open</button>}>
                <li>Item</li>
            </Dropdown>
        );

        const trigger = getByText("Open");
        const dropdown = container.querySelector(".pure-menu-has-children") as HTMLElement;

        expect(dropdown.classList.contains("pure-menu-active")).toBe(false);

        fireEvent.click(trigger);
        expect(dropdown.classList.contains("pure-menu-active")).toBe(true);

        fireEvent.click(trigger);
        expect(dropdown.classList.contains("pure-menu-active")).toBe(false);
    });

    test("closes when clicking outside", () => {
        const { container, getByText } = render(
            <>
                <Dropdown trigger={<button type="button">Open</button>}>
                    <li>Item</li>
                </Dropdown>
                <button type="button">Outside</button>
            </>
        );

        const trigger = getByText("Open");
        const outside = getByText("Outside");
        const dropdown = container.querySelector(".pure-menu-has-children") as HTMLElement;

        fireEvent.click(trigger);
        expect(dropdown.classList.contains("pure-menu-active")).toBe(true);

        fireEvent.mouseDown(outside);
        expect(dropdown.classList.contains("pure-menu-active")).toBe(false);
    });
});
