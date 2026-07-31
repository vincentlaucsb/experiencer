import ResumeTemplates from "@/templates/ResumeTemplates";
import { ResumeSaveData } from "@/types";
import LocalStorageResumeRepository from "@/shared/repositories/LocalStorageResumeRepository";
import {
    ResumeDocumentSummary,
    ResumeRepository,
    ResumeRepositoryError
} from "@/shared/repositories/ResumeRepository";
import loadData from "@/shared/stores/loadData";
import { dump } from "@/shared/stores/saveResume";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { workspaceStore } from "@/shared/stores/workspaceStore";
import { cssStore, rootCssStore } from "@/shared/stores/cssStoreHooks";
import { ResumeDocument } from "@/shared/repositories/ResumeRepository";

export interface ResumeLibrarySnapshot {
    documents: ResumeDocumentSummary[];
    activeDocumentId?: string;
    saveStatus: string;
}

export interface ResumeLibraryController {
    subscribe(listener: () => void): () => void;
    getSnapshot(): ResumeLibrarySnapshot;
    initialize(): Promise<void>;
    selectDocument(id: string): Promise<void>;
    hasUnsavedChanges(): boolean;
    saveCurrentDocument(): Promise<ResumeDocument | undefined>;
    createDocumentFromTemplate(key?: string): Promise<void>;
    importDocument(data: object, title?: string): Promise<void>;
    deleteDocument(id: string): Promise<void>;
    renameDocument(id: string, title: string): Promise<string | null>;
    applyExternalDocument(document: ResumeDocument, saveStatus?: string): Promise<void>;
    refreshCurrentDocument(): Promise<ResumeDocumentSummary | undefined>;
}

const initialSnapshot: ResumeLibrarySnapshot = {
    documents: [],
    saveStatus: "Not synced"
};

/** Coordinates the OSS document lifecycle through an injectable resume repository. */
export default class ResumeLibraryStore implements ResumeLibraryController {
    private snapshot = initialSnapshot;
    private listeners = new Set<() => void>();
    private initialization?: Promise<void>;

    constructor(private readonly repository: ResumeRepository = new LocalStorageResumeRepository()) {}

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.snapshot;

    initialize = () => {
        if (!this.initialization) {
            this.initialization = this.loadInitialDocument();
        }

        return this.initialization;
    };

    selectDocument = async (id: string) => {
        const document = await this.repository.get(id);
        if (!document) {
            return;
        }

        loadData(document.data, "normal", id);
        await this.repository.setActiveId(id);
        this.setSnapshot({
            activeDocumentId: id,
            saveStatus: `Loaded v${document.version}`
        });
        await this.refreshDocuments();
    };

    hasUnsavedChanges = () =>
        resumeNodeStore.hasUnsavedChanges()
        || cssStore.hasUnsavedChanges()
        || rootCssStore.hasUnsavedChanges();

    saveCurrentDocument = async (): Promise<ResumeDocument | undefined> => {
        this.setSnapshot({ saveStatus: "Saving" });

        try {
            const data = dump();
            const activeDocumentId = this.snapshot.activeDocumentId;
            let saved: ResumeDocument;

            if (activeDocumentId) {
                const current = this.snapshot.documents.find((document) => document.id === activeDocumentId);
                saved = await this.repository.save(activeDocumentId, {
                    title: current?.title ?? "Untitled Resume",
                    schemaVersion: current?.schemaVersion ?? 1,
                    expectedVersion: current?.version,
                    data
                });

                await this.repository.setActiveId(saved.id);
                this.setSnapshot({
                    activeDocumentId: saved.id,
                    saveStatus: `Saved v${saved.version}`
                });
            } else {
                saved = await this.repository.create({
                    title: "Untitled Resume",
                    schemaVersion: 1,
                    data
                });

                await this.repository.setActiveId(saved.id);
                this.setSnapshot({
                    activeDocumentId: saved.id,
                    saveStatus: `Saved v${saved.version}`
                });
            }

            workspaceStore.rememberDocument(saved.id);
            resumeNodeStore.clearUnsavedChanges();
            cssStore.clearUnsavedChanges();
            rootCssStore.clearUnsavedChanges();
            await this.refreshDocuments();
            return saved;
        } catch {
            this.setSnapshot({ saveStatus: "Save failed" });
            return undefined;
        }
    };

    createDocumentFromTemplate = async (key = "Integrity") => {
        this.setSnapshot({ saveStatus: "Creating" });

        try {
            const template: ResumeSaveData = ResumeTemplates.templates[key];
            const document = await this.repository.create({
                title: key,
                schemaVersion: 1,
                data: template
            });

            loadData(document.data, "normal", document.id);
            await this.repository.setActiveId(document.id);
            this.setSnapshot({
                activeDocumentId: document.id,
                saveStatus: `Saved v${document.version}`
            });
            await this.refreshDocuments();
        } catch {
            this.setSnapshot({ saveStatus: "Create failed" });
        }
    };

    importDocument = async (data: object, title = "Imported Resume") => {
        this.setSnapshot({ saveStatus: "Importing" });

        try {
            const resumeData = data as ResumeSaveData;
            const document = await this.repository.create({
                title,
                schemaVersion: 1,
                data: resumeData
            });

            loadData(document.data, "normal", document.id);
            await this.repository.setActiveId(document.id);
            this.setSnapshot({
                activeDocumentId: document.id,
                saveStatus: `Imported v${document.version}`
            });
            await this.refreshDocuments();
        } catch {
            this.setSnapshot({ saveStatus: "Import failed" });
        }
    };

    deleteDocument = async (id: string) => {
        this.setSnapshot({ saveStatus: "Deleting" });

        try {
            await this.repository.delete(id);
            const remainingDocuments = await this.refreshDocuments();

            if (this.snapshot.activeDocumentId === id) {
                const nextDocument = remainingDocuments.find((document) => document.id !== id);
                this.setSnapshot({ activeDocumentId: undefined });
                resumeNodeStore.setNodes([]);

                if (nextDocument) {
                    await this.selectDocument(nextDocument.id);
                } else {
                    workspaceStore.reset();
                    this.setSnapshot({ saveStatus: "Not synced" });
                }
            } else {
                this.setSnapshot({ saveStatus: "Deleted" });
            }
        } catch {
            this.setSnapshot({ saveStatus: "Delete failed" });
        }
    };

    renameDocument = async (id: string, title: string) => {
        this.setSnapshot({ saveStatus: "Renaming" });

        try {
            const renamed = await this.repository.rename(id, title);
            await this.refreshDocuments();
            this.setSnapshot({
                saveStatus: this.snapshot.activeDocumentId === id ? `Renamed v${renamed.version}` : "Renamed"
            });
            return null;
        } catch (error: unknown) {
            this.setSnapshot({ saveStatus: "Rename failed" });
            return error instanceof ResumeRepositoryError
                ? error.message
                : "Could not rename this resume. Please try again.";
        }
    };

    applyExternalDocument = async (
        document: ResumeDocument,
        saveStatus = `Loaded v${document.version}`
    ) => {
        loadData(document.data, "normal", document.id);
        resumeNodeStore.clearUnsavedChanges();
        cssStore.clearUnsavedChanges();
        rootCssStore.clearUnsavedChanges();
        await this.repository.setActiveId(document.id);
        this.setSnapshot({
            activeDocumentId: document.id,
            saveStatus
        });
        await this.refreshDocuments();
    };

    refreshCurrentDocument = async () => {
        const documents = await this.refreshDocuments();
        return documents.find((document) => document.id === this.snapshot.activeDocumentId);
    };

    private async loadInitialDocument() {
        this.setSnapshot({ saveStatus: "Loading" });

        try {
            await this.refreshDocuments();
            this.setSnapshot({ saveStatus: "Not synced" });
        } catch {
            this.setSnapshot({ saveStatus: "Load failed" });
        }
    }

    private async refreshDocuments() {
        const documents = await this.repository.list();
        this.setSnapshot({ documents });
        return documents;
    }

    private setSnapshot(patch: Partial<ResumeLibrarySnapshot>) {
        this.snapshot = {
            ...this.snapshot,
            ...patch
        };
        this.emit();
    }

    private emit() {
        this.listeners.forEach((listener) => listener());
    }
}
