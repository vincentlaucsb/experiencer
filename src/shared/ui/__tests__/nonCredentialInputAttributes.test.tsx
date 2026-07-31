/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";

describe("nonCredentialInputAttributes", () => {
    test.each(["input", "textarea"])("renders autofill exclusions on a %s", (elementName) => {
        const { container } = render(
            elementName === "input"
                ? <input {...nonCredentialInputAttributes} />
                : <textarea {...nonCredentialInputAttributes} />
        );
        const field = container.firstElementChild;

        expect(field?.getAttribute("autocomplete")).toBe("off");
        expect(field?.getAttribute("data-form-type")).toBe("other");
        expect(field?.getAttribute("data-lpignore")).toBe("true");
        expect(field?.getAttribute("data-1p-ignore")).toBe("true");
        expect(field?.getAttribute("data-op-ignore")).toBe("true");
        expect(field?.getAttribute("data-bwignore")).toBe("true");
    });
});
