import { ResumeSaveData } from "@/types";

export interface ResumeDocumentSummary {
    id: string;
    title: string;
    schemaVersion: number;
    version: number;
    updatedAt: string;
}

export interface ResumeDocument extends ResumeDocumentSummary {
    data: ResumeSaveData;
}

export interface SaveResumeDocumentInput {
    title: string;
    schemaVersion: number;
    data: ResumeSaveData;
    expectedVersion?: number;
    idempotencyKey?: string;
}

export interface ResumeRepository {
    list(): Promise<ResumeDocumentSummary[]>;
    get(id: string): Promise<ResumeDocument | undefined>;
    create(input: SaveResumeDocumentInput): Promise<ResumeDocument>;
    save(id: string, input: SaveResumeDocumentInput): Promise<ResumeDocument>;
    rename(id: string, title: string): Promise<ResumeDocumentSummary>;
    delete(id: string): Promise<void>;
    getActiveId(): Promise<string | undefined>;
    setActiveId(id: string): Promise<void>;
}

export type ResumeRepositoryErrorCode =
    | "not-found"
    | "conflict"
    | "access-required"
    | "unavailable";

export class ResumeRepositoryError extends Error {
    constructor(
        public readonly code: ResumeRepositoryErrorCode,
        message: string
    ) {
        super(message);
        this.name = "ResumeRepositoryError";
    }
}

export type SaveExistingResumeResult =
    | { status: "saved"; document: ResumeDocument }
    | { status: "not-found" }
    | { status: "conflict" };

/**
 * Owns the behavioral contract for updating an existing resume.
 *
 * Implementations perform their storage-specific update atomically and report
 * the outcome. They cannot accidentally turn save() into create().
 */
export abstract class BaseResumeRepository implements ResumeRepository {
    abstract list(): Promise<ResumeDocumentSummary[]>;
    abstract get(id: string): Promise<ResumeDocument | undefined>;
    abstract create(input: SaveResumeDocumentInput): Promise<ResumeDocument>;
    abstract rename(id: string, title: string): Promise<ResumeDocumentSummary>;
    abstract delete(id: string): Promise<void>;
    abstract getActiveId(): Promise<string | undefined>;
    abstract setActiveId(id: string): Promise<void>;

    async save(id: string, input: SaveResumeDocumentInput): Promise<ResumeDocument> {
        const result = await this.trySaveExisting(id, input);
        if (result.status === "saved") {
            return result.document;
        }

        if (result.status === "not-found") {
            throw new ResumeRepositoryError("not-found", "Resume not found.");
        }

        throw new ResumeRepositoryError(
            "conflict",
            "The resume has changed since it was loaded."
        );
    }

    protected abstract trySaveExisting(
        id: string,
        input: SaveResumeDocumentInput
    ): Promise<SaveExistingResumeResult>;
}
