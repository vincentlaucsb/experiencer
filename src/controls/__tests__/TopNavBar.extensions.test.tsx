import { render, screen } from "@testing-library/react";

import { TopNavBar } from "@/controls/TopNavBar";

const baseProps = {
    isEditing: true,
    mode: "normal" as const,
    exportHtml: jest.fn(),
    exportToPng: jest.fn(),
    loadData: jest.fn(),
    saveFile: jest.fn(),
    saveLocal: jest.fn(),
    print: jest.fn(),
    new: jest.fn(),
    toggleLanding: jest.fn(),
    toggleHelp: jest.fn()
};

test("renders optional top-menu extension items without knowing their feature", () => {
    const { rerender } = render(<TopNavBar {...baseProps} />);
    expect(screen.queryByRole("button", { name: "Extension action" })).toBeNull();

    rerender(
        <TopNavBar
            {...baseProps}
            extraItems={<button type="button">Extension action</button>}
        />
    );

    expect(screen.getByRole("button", { name: "Extension action" })).toBeTruthy();
});
