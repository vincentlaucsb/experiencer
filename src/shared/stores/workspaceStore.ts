import { EditorMode } from "@/types";

export type EditingWorkspaceMode = "normal";
export type NonEditingWorkspaceMode = "landing" | "changingTemplate";

export type WorkspaceSnapshot =
    | {
        mode: NonEditingWorkspaceMode;
        activeDocumentId?: never;
        suspendedDocumentId?: string;
        hasSuspendedSession: boolean;
    }
    | {
        mode: EditingWorkspaceMode;
        activeDocumentId?: string;
        suspendedDocumentId?: never;
        hasSuspendedSession?: never;
    };

const initialSnapshot: WorkspaceSnapshot = {
    mode: "landing",
    hasSuspendedSession: false
};

export function isEditingMode(mode: EditorMode): mode is EditingWorkspaceMode {
    return mode === "normal";
}

/**
 * Owns the editor's document-session state and valid view transitions.
 *
 * Suspended documents must not authorize document-scoped controls.
 */
export class WorkspaceStore {
    private snapshot: WorkspaceSnapshot = initialSnapshot;
    private listeners = new Set<() => void>();

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.snapshot;

    reset = () => {
        this.setSnapshot({
            mode: "landing",
            hasSuspendedSession: false
        });
    };

    openDocument = (documentId?: string) => {
        this.setSnapshot({
            mode: "normal",
            activeDocumentId: documentId
        });
    };

    rememberDocument = (documentId?: string) => {
        if (isEditingMode(this.snapshot.mode)) {
            this.setSnapshot({
                mode: this.snapshot.mode,
                activeDocumentId: documentId
            });
            return;
        }

        this.setSnapshot({
            mode: this.snapshot.mode,
            suspendedDocumentId: this.snapshot.hasSuspendedSession
                ? documentId
                : this.snapshot.suspendedDocumentId,
            hasSuspendedSession: Boolean(this.snapshot.hasSuspendedSession)
        });
    };

    showLanding = (returnDocumentId?: string) => {
        const wasEditing = isEditingMode(this.snapshot.mode);
        const suspendedDocumentId = wasEditing
            ? this.snapshot.activeDocumentId
            : this.snapshot.suspendedDocumentId;
        this.setSnapshot({
            mode: "landing",
            suspendedDocumentId: returnDocumentId ?? suspendedDocumentId,
            hasSuspendedSession: wasEditing
                || Boolean(this.snapshot.hasSuspendedSession)
        });
    };

    showTemplateSelector = () => {
        const wasEditing = isEditingMode(this.snapshot.mode);
        this.setSnapshot({
            mode: "changingTemplate",
            suspendedDocumentId: wasEditing
                ? this.snapshot.activeDocumentId
                : this.snapshot.suspendedDocumentId,
            hasSuspendedSession: wasEditing
                || Boolean(this.snapshot.hasSuspendedSession)
        });
    };

    returnToEditing = () => {
        if (!isEditingMode(this.snapshot.mode) && !this.snapshot.hasSuspendedSession) {
            return false;
        }
        const documentId = this.snapshot.activeDocumentId
            ?? this.snapshot.suspendedDocumentId;
        this.openDocument(documentId);
        return true;
    };

    /**
     * Compatibility boundary for serialized imports and controlled host props.
     * Callers still receive invariant-safe state instead of mutating mode.
     */
    transitionTo = (mode: EditorMode, documentId?: string) => {
        switch (mode) {
            case "landing":
                this.showLanding(documentId);
                break;
            case "changingTemplate":
                this.showTemplateSelector();
                break;
            case "normal":
                this.openDocument(documentId);
                break;
        }
    };

    private setSnapshot(snapshot: WorkspaceSnapshot) {
        this.snapshot = snapshot;
        this.listeners.forEach((listener) => listener());
    }
}

export const workspaceStore = new WorkspaceStore();
