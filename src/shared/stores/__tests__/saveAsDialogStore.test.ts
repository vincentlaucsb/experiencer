import { SaveAsDialogStore } from "@/shared/stores/saveAsDialogStore";

test("opens only while Save As is available", () => {
    const store = new SaveAsDialogStore();

    store.open();
    expect(store.getSnapshot().isOpen).toBe(false);

    store.setAvailable(true);
    store.open();
    expect(store.getSnapshot().isOpen).toBe(true);
});

test("leaving the editing surface closes an open dialog", () => {
    const store = new SaveAsDialogStore();
    store.setAvailable(true);
    store.open();

    store.setAvailable(false);

    expect(store.getSnapshot().isOpen).toBe(false);
});

test("publishes only real visibility changes", () => {
    const store = new SaveAsDialogStore();
    const listener = jest.fn();
    store.subscribe(listener);
    store.setAvailable(true);

    store.open();
    store.open();
    store.close();
    store.close();

    expect(listener).toHaveBeenCalledTimes(2);
});
