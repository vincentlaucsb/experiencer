import { Globals, ResumeSaveData } from "@/types";
import {
    BaseResumeRepository,
    ResumeDocument,
    ResumeDocumentSummary,
    SaveExistingResumeResult,
    SaveResumeDocumentInput
} from "./ResumeRepository";

const indexKey = `${Globals.localStorageKey}.documents`;
const activeIdKey = `${Globals.localStorageKey}.activeResumeId`;
const documentKey = (id: string) => `${Globals.localStorageKey}.document.${id}`;

export default class LocalStorageResumeRepository extends BaseResumeRepository {
    async list(): Promise<ResumeDocumentSummary[]> {
        this.migrateLegacyResume();
        return this.readIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    async get(id: string): Promise<ResumeDocument | undefined> {
        this.migrateLegacyResume();
        const rawDocument = localStorage.getItem(documentKey(id));
        return rawDocument ? JSON.parse(rawDocument) as ResumeDocument : undefined;
    }

    async create(input: SaveResumeDocumentInput): Promise<ResumeDocument> {
        const now = new Date().toISOString();
        const document: ResumeDocument = {
            id: crypto.randomUUID(),
            title: input.title,
            schemaVersion: input.schemaVersion,
            version: 1,
            updatedAt: now,
            data: input.data
        };

        this.writeDocument(document);
        await this.setActiveId(document.id);
        return document;
    }

    protected async trySaveExisting(
        id: string,
        input: SaveResumeDocumentInput
    ): Promise<SaveExistingResumeResult> {
        const current = await this.get(id);
        if (!current) {
            return { status: "not-found" };
        }
        if (input.expectedVersion !== undefined && input.expectedVersion !== current.version) {
            return { status: "conflict" };
        }

        const document: ResumeDocument = {
            id,
            title: input.title,
            schemaVersion: input.schemaVersion,
            version: current.version + 1,
            updatedAt: new Date().toISOString(),
            data: input.data
        };

        this.writeDocument(document);
        await this.setActiveId(document.id);
        return { status: "saved", document };
    }

    async rename(id: string, title: string): Promise<ResumeDocumentSummary> {
        const current = await this.get(id);
        if (!current) {
            throw new Error("Resume not found.");
        }

        const renamed: ResumeDocument = {
            ...current,
            title: this.normalizeTitle(title),
            updatedAt: new Date().toISOString()
        };

        this.writeDocument(renamed);
        return this.toSummary(renamed);
    }

    async delete(id: string): Promise<void> {
        localStorage.removeItem(documentKey(id));
        this.writeIndex(this.readIndex().filter((document) => document.id !== id));

        if (localStorage.getItem(activeIdKey) === id) {
            const next = this.readIndex()[0];
            if (next) {
                localStorage.setItem(activeIdKey, next.id);
            } else {
                localStorage.removeItem(activeIdKey);
            }
        }
    }

    async getActiveId(): Promise<string | undefined> {
        this.migrateLegacyResume();
        return localStorage.getItem(activeIdKey) ?? undefined;
    }

    async setActiveId(id: string): Promise<void> {
        localStorage.setItem(activeIdKey, id);
    }

    private readIndex(): ResumeDocumentSummary[] {
        const rawIndex = localStorage.getItem(indexKey);
        return rawIndex ? JSON.parse(rawIndex) as ResumeDocumentSummary[] : [];
    }

    private writeIndex(index: ResumeDocumentSummary[]) {
        localStorage.setItem(indexKey, JSON.stringify(index));
    }

    private writeDocument(document: ResumeDocument) {
        localStorage.setItem(documentKey(document.id), JSON.stringify(document));
        localStorage.setItem(Globals.localStorageKey, JSON.stringify(document.data));

        const summary = this.toSummary(document);

        this.writeIndex([
            summary,
            ...this.readIndex().filter((item) => item.id !== document.id)
        ]);
    }

    private toSummary(document: ResumeDocument): ResumeDocumentSummary {
        return {
            id: document.id,
            title: document.title,
            schemaVersion: document.schemaVersion,
            version: document.version,
            updatedAt: document.updatedAt
        };
    }

    private normalizeTitle(title: string): string {
        return title.trim() || "Untitled Resume";
    }

    private migrateLegacyResume() {
        if (this.readIndex().length > 0) {
            return;
        }

        const legacyResume = localStorage.getItem(Globals.localStorageKey);
        if (!legacyResume) {
            return;
        }

        try {
            const data = JSON.parse(legacyResume) as ResumeSaveData;
            const now = new Date().toISOString();
            const document: ResumeDocument = {
                id: crypto.randomUUID(),
                title: "Local Resume",
                schemaVersion: 1,
                version: 1,
                updatedAt: now,
                data
            };

            this.writeDocument(document);
            localStorage.setItem(activeIdKey, document.id);
        } catch {
            // Keep the legacy value untouched if it cannot be parsed.
        }
    }
}
