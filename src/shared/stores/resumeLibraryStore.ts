import ResumeTemplates from "@/templates/ResumeTemplates";
import { ResumeSaveData } from "@/types";
import LocalStorageResumeRepository from "@/shared/repositories/LocalStorageResumeRepository";
import { ResumeDocumentSummary, ResumeRepository } from "@/shared/repositories/ResumeRepository";
import loadData from "@/shared/stores/loadData";
import { dump } from "@/shared/stores/saveResume";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { useEditorStore } from "@/shared/stores/editorStore";

export interface ResumeLibrarySnapshot {
    documents: ResumeDocumentSummary[];
    activeDocumentId?: string;
    saveStatus: string;
}

const initialSnapshot: ResumeLibrarySnapshot = {
    documents: [],
    saveStatus: "Not synced"
};

export default class ResumeLibraryStore {
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

        loadData(document.data, "normal");
        await this.repository.setActiveId(id);
        this.setSnapshot({
            activeDocumentId: id,
            saveStatus: `Loaded v${document.version}`
        });
        await this.refreshDocuments();
    };

    saveCurrentDocument = async () => {
        this.setSnapshot({ saveStatus: "Saving" });

        try {
            const data = dump();
            const activeDocumentId = this.snapshot.activeDocumentId;

            if (activeDocumentId) {
                const current = this.snapshot.documents.find((document) => document.id === activeDocumentId);
                const saved = await this.repository.save(activeDocumentId, {
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
                const saved = await this.repository.create({
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

            await this.refreshDocuments();
        } catch {
            this.setSnapshot({ saveStatus: "Save failed" });
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

            loadData(document.data, "normal");
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
                    useEditorStore.getState().setMode("landing");
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
        } catch {
            this.setSnapshot({ saveStatus: "Rename failed" });
        }
    };

    private async loadInitialDocument() {
        this.setSnapshot({ saveStatus: "Loading" });

        try {
            const summaries = await this.refreshDocuments();
            const activeId = await this.repository.getActiveId();
            const documentId = activeId ?? summaries[0]?.id;

            if (documentId) {
                await this.selectDocument(documentId);
            } else {
                this.setSnapshot({ saveStatus: "Not synced" });
            }
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
