/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { Button } from "@/controls/Buttons";

describe("Button", () => {
    test.each([
        ["primary", "pure-button-primary"],
        ["success", "pure-button-success"],
        ["warning", "pure-button-warning"],
        ["error", "pure-button-error"],
    ] as const)("maps the %s variant to the shared Pure class", (variant, className) => {
        render(<Button variant={variant}>{variant}</Button>);

        const button = screen.getByRole("button", { name: variant });
        expect(button.classList.contains("pure-button")).toBe(true);
        expect(button.classList.contains(className)).toBe(true);
    });

    test("keeps the primary prop as a compatibility alias", () => {
        render(<Button primary>Continue</Button>);

        expect(
            screen.getByRole("button", { name: "Continue" })
                .classList.contains("pure-button-primary")
        ).toBe(true);
    });

    test("composes the outline appearance with a semantic variant", () => {
        render(<Button appearance="outline" variant="error">Delete</Button>);

        const button = screen.getByRole("button", { name: "Delete" });
        expect(button.classList.contains("pure-button-error")).toBe(true);
        expect(button.classList.contains("pure-button-outline")).toBe(true);
    });
});
