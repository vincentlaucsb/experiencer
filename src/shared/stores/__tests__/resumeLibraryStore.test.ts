import ResumeLibraryStore from "@/shared/stores/resumeLibraryStore";
import type { ResumeDocument, ResumeDocumentSummary, ResumeRepository, SaveResumeDocumentInput } from "@/shared/repositories/ResumeRepository";
import ResumeTemplates from "@/templates/ResumeTemplates";

function createRepository(document: ResumeDocument): jest.Mocked<ResumeRepository> {
    const summary: ResumeDocumentSummary = {
        id: document.id,
        title: document.title,
        schemaVersion: document.schemaVersion,
        version: document.version,
        updatedAt: document.updatedAt
    };

    return {
        list: jest.fn(async () => [summary]),
        get: jest.fn(async (_id: string) => document),
        create: jest.fn(async (input: SaveResumeDocumentInput) => ({
            id: "created-resume",
            title: input.title,
            schemaVersion: input.schemaVersion,
            version: 1,
            updatedAt: "2026-05-07T00:00:00.000Z",
            data: input.data
        })),
        save: jest.fn(async (id: string, input: SaveResumeDocumentInput) => ({
            id,
            title: input.title,
            schemaVersion: input.schemaVersion,
            version: (input.expectedVersion ?? 0) + 1,
            updatedAt: "2026-05-07T00:00:00.000Z",
            data: input.data
        })),
        rename: jest.fn(async (id: string, title: string) => ({
            ...summary,
            id,
            title
        })),
        delete: jest.fn(async (_id: string) => undefined),
        getActiveId: jest.fn(async () => document.id),
        setActiveId: jest.fn(async (_id: string) => undefined)
    };
}

test("initialize lists saved resumes without auto-loading one", async () => {
    const document: ResumeDocument = {
        id: "saved-resume",
        title: "Saved Resume",
        schemaVersion: 1,
        version: 3,
        updatedAt: "2026-05-07T00:00:00.000Z",
        data: ResumeTemplates.templates.Integrity
    };
    const repository = createRepository(document);
    const store = new ResumeLibraryStore(repository);

    await store.initialize();

    expect(repository.list).toHaveBeenCalledTimes(1);
    expect(repository.getActiveId).not.toHaveBeenCalled();
    expect(repository.get).not.toHaveBeenCalled();
    expect(repository.setActiveId).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toEqual({
        documents: [
            {
                id: "saved-resume",
                title: "Saved Resume",
                schemaVersion: 1,
                version: 3,
                updatedAt: "2026-05-07T00:00:00.000Z"
            }
        ],
        saveStatus: "Not synced"
    });
});
