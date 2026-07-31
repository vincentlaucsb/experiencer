import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AsyncActionForm from "../AsyncActionForm";

test("renders an action error between the fields and buttons", async () => {
    const save = jest.fn(async () => "The server rejected this value.");
    const { container } = render(
        <AsyncActionForm cancel={jest.fn()} save={save}>
            <label>
                Name
                <input />
            </label>
        </AsyncActionForm>
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
        "The server rejected this value."
    );
    const form = container.querySelector("form")!;
    const formChildren = Array.from(form.children);
    expect(formChildren.indexOf(screen.getByRole("alert"))).toBeLessThan(
        formChildren.indexOf(screen.getByRole("button", { name: "Save" }).parentElement!)
    );
});

test("prevents duplicate actions and shows a safe message for thrown errors", async () => {
    let rejectSave!: (error: Error) => void;
    const save = jest.fn(() => new Promise<string | null>((_resolve, reject) => {
        rejectSave = reject;
    }));
    render(
        <AsyncActionForm cancel={jest.fn()} save={save}>
            <input aria-label="Name" />
        </AsyncActionForm>
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect((screen.getByRole("button", { name: "Saving…" }) as HTMLButtonElement).disabled)
        .toBe(true);
    expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled)
        .toBe(true);
    fireEvent.submit(document.querySelector("form")!);
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => rejectSave(new Error("private implementation detail")));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(
        "Could not save. Please try again."
    ));
});
