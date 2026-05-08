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
