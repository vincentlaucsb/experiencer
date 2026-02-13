/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from "@testing-library/react";
import { ContainerPresentation } from "@/resume/infrastructure/Container";

jest.mock("@/resume/infrastructure/OverlayEditor", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="overlay-editor">{children}</div>
    )
}));

describe("ContainerPresentation", () => {
    test("calls onSelect when clicking unselected node", () => {
        const onSelect = jest.fn();
        const onEdit = jest.fn();
        const onContextMenu = jest.fn();

        const { container } = render(
            <ContainerPresentation
                id={[0]}
                uuid="node-1"
                isSelected={false}
                isEditing={false}
                onSelect={onSelect}
                onEdit={onEdit}
                onContextMenuOpen={onContextMenu}
            >
                <span>Child</span>
            </ContainerPresentation>
        );

        const element = container.querySelector('[data-uuid="node-1"]') as HTMLElement;
        fireEvent.click(element);

        expect(onSelect).toHaveBeenCalledWith("node-1");
        expect(onEdit).not.toHaveBeenCalled();
    });

    test("calls onEdit when clicking selected node", () => {
        const onSelect = jest.fn();
        const onEdit = jest.fn();
        const onContextMenu = jest.fn();

        const { container } = render(
            <ContainerPresentation
                id={[0]}
                uuid="node-1"
                isSelected={true}
                isEditing={false}
                onSelect={onSelect}
                onEdit={onEdit}
                onContextMenuOpen={onContextMenu}
            >
                <span>Child</span>
            </ContainerPresentation>
        );

        const element = container.querySelector('[data-uuid="node-1"]') as HTMLElement;
        fireEvent.click(element);

        expect(onEdit).toHaveBeenCalledWith("node-1");
        expect(onSelect).not.toHaveBeenCalled();
    });

    test("calls onContextMenuOpen when right-clicking and not editing", () => {
        const onSelect = jest.fn();
        const onEdit = jest.fn();
        const onContextMenuOpen = jest.fn();

        const { container } = render(
            <ContainerPresentation
                id={[0]}
                uuid="node-2"
                isSelected={false}
                isEditing={false}
                onSelect={onSelect}
                onEdit={onEdit}
                onContextMenuOpen={onContextMenuOpen}
            >
                <span>Child</span>
            </ContainerPresentation>
        );

        const element = container.querySelector('[data-uuid="node-2"]') as HTMLElement;
        fireEvent.contextMenu(element);

        expect(onContextMenuOpen).toHaveBeenCalledWith("node-2");
    });

    test("does not call onContextMenuOpen when right-clicking while editing", () => {
        const onSelect = jest.fn();
        const onEdit = jest.fn();
        const onContextMenuOpen = jest.fn();

        const { container } = render(
            <ContainerPresentation
                id={[0]}
                uuid="node-3"
                isSelected={true}
                isEditing={true}
                onSelect={onSelect}
                onEdit={onEdit}
                onContextMenuOpen={onContextMenuOpen}
            >
                <span>Child</span>
            </ContainerPresentation>
        );

        const element = container.querySelector('[data-uuid="node-3"]') as HTMLElement;
        fireEvent.contextMenu(element);

        expect(onContextMenuOpen).not.toHaveBeenCalled();
    });

    test("adds data-selected attribute when isSelected is true", () => {
        const { container } = render(
            <ContainerPresentation
                id={[0]}
                uuid="node-3"
                isSelected={true}
                isEditing={false}
                onSelect={jest.fn()}
                onEdit={jest.fn()}
                onContextMenuOpen={jest.fn()}
            >
                <span>Child</span>
            </ContainerPresentation>
        );

        const element = container.querySelector('[data-uuid="node-3"]') as HTMLElement;
        expect(element.hasAttribute("data-selected")).toBe(true);
    });

    test("renders overlay editor when editContent provided and isEditing true", () => {
        const { getByTestId } = render(
            <ContainerPresentation
                id={[0]}
                uuid="node-4"
                isSelected={true}
                isEditing={true}
                onSelect={jest.fn()}
                onEdit={jest.fn()}
                onContextMenuOpen={jest.fn()}
                editContent={<div>Editor</div>}
            >
                <span>Child</span>
            </ContainerPresentation>
        );

        expect(getByTestId("overlay-editor")).toBeTruthy();
    });

    test("does not render overlay editor when editContent not provided", () => {
        const { queryByTestId } = render(
            <ContainerPresentation
                id={[0]}
                uuid="node-5"
                isSelected={false}
                isEditing={false}
                onSelect={jest.fn()}
                onEdit={jest.fn()}
                onContextMenuOpen={jest.fn()}
            >
                <span>Child</span>
            </ContainerPresentation>
        );

        expect(queryByTestId("overlay-editor")).toBeNull();
    });
});
