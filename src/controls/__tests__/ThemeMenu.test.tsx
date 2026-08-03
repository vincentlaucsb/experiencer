import { fireEvent, render, screen } from "@testing-library/react";

import ThemeMenu from "@/controls/ThemeMenu";
import { themeStore } from "@/shared/stores/themeStore";

beforeEach(() => {
    themeStore.setPreference("system");
});

afterEach(() => {
    themeStore.setPreference("system");
});

test("shows the current preference and applies a selected theme", () => {
    render(<ThemeMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Theme: System" }));
    const darkOption = screen.getByRole("menuitem", { name: "Dark" });

    fireEvent.click(darkOption);

    expect(screen.getByRole("button", { name: "Theme: Dark" })).toBeTruthy();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("experiencer.theme")).toBe("dark");
});
