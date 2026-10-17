import { act, fireEvent, render, screen } from "@testing-library/react";

import TextField from "@/controls/inputs/TextField";
import ResumeTextField from "@/resume/helpers/ResumeTextField";
import { resumeSpellCheckStore } from "@/shared/stores/resumeSpellCheckStore";

afterEach(() => act(() => resumeSpellCheckStore.setEnabled(true)));

test("résumé fields follow the spellcheck preference while editing", () => {
    render(<ResumeTextField value="Synthetic title" onChange={jest.fn()} />);
    fireEvent.click(screen.getByText("Synthetic title"));
    const input = screen.getByDisplayValue("Synthetic title");
    expect(input.getAttribute("spellcheck")).toBe("true");

    act(() => resumeSpellCheckStore.setEnabled(false));
    expect(input.getAttribute("spellcheck")).toBe("false");
});

test("generic fields such as CSS values are never spellchecked", () => {
    render(<TextField value="font-size" onChange={jest.fn()} />);
    fireEvent.click(screen.getByText("font-size"));
    expect(screen.getByDisplayValue("font-size").getAttribute("spellcheck")).toBe("false");
});
