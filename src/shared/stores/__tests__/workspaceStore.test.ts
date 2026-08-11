import {
    isEditingMode,
    WorkspaceStore
} from "@/shared/stores/workspaceStore";

test("landing suspends the editing document and returning restores it", () => {
    const store = new WorkspaceStore();

    store.openDocument("resume-1");
    expect(store.getSnapshot()).toEqual({
        mode: "normal",
        activeDocumentId: "resume-1"
    });

    store.showLanding();
    expect(store.getSnapshot()).toEqual({
        mode: "landing",
        suspendedDocumentId: "resume-1",
        hasSuspendedSession: true
    });
    expect(store.getSnapshot().activeDocumentId).toBeUndefined();

    store.returnToEditing();
    expect(store.getSnapshot()).toEqual({
        mode: "normal",
        activeDocumentId: "resume-1"
    });
});

test("non-editing modes cannot retain an active document", () => {
    const store = new WorkspaceStore();
    store.openDocument("resume-1");

    store.showTemplateSelector();

    expect(store.getSnapshot()).toEqual({
        mode: "changingTemplate",
        suspendedDocumentId: "resume-1",
        hasSuspendedSession: true
    });
    expect(store.getSnapshot().activeDocumentId).toBeUndefined();
    expect(isEditingMode(store.getSnapshot().mode)).toBe(false);
});

test("printing starts only from editing and restores the document", () => {
    const store = new WorkspaceStore();

    expect(store.startPrinting()).toBe(false);
    expect(store.getSnapshot().mode).toBe("landing");

    store.openDocument("resume-1");
    expect(store.startPrinting()).toBe(true);
    expect(store.getSnapshot()).toEqual({
        mode: "printing",
        activeDocumentId: "resume-1",
        returnMode: "normal"
    });

    store.finishPrinting();
    expect(store.getSnapshot()).toEqual({
        mode: "normal",
        activeDocumentId: "resume-1"
    });
});

test("remembering a persisted document does not invent a live suspended session", () => {
    const store = new WorkspaceStore();

    store.rememberDocument("resume-1");

    expect(store.getSnapshot()).toEqual({
        mode: "landing",
        hasSuspendedSession: false
    });
    expect(store.returnToEditing()).toBe(false);
});
