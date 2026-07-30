import ResumeTemplates from "@/templates/ResumeTemplates";
import LocalStorageResumeRepository from "../LocalStorageResumeRepository";
import {
    BaseResumeRepository,
    ResumeDocument,
    ResumeDocumentSummary,
    ResumeRepositoryError,
    SaveExistingResumeResult,
    SaveResumeDocumentInput
} from "../ResumeRepository";

const data = ResumeTemplates.templates.Integrity;

class TestRepository extends BaseResumeRepository {
    constructor(private readonly result: SaveExistingResumeResult) {
        super();
    }

    list = async (): Promise<ResumeDocumentSummary[]> => [];
    get = async (_id: string) => undefined;
    create = async (_input: SaveResumeDocumentInput): Promise<ResumeDocument> => {
        throw new Error("not used");
    };
    rename = async (_id: string, _title: string): Promise<ResumeDocumentSummary> => {
        throw new Error("not used");
    };
    delete = async (_id: string) => undefined;
    getActiveId = async () => undefined;
    setActiveId = async (_id: string) => undefined;

    protected trySaveExisting = async (
        _id: string,
        _input: SaveResumeDocumentInput
    ) => this.result;
}

const input: SaveResumeDocumentInput = {
    title: "Resume",
    schemaVersion: 1,
    expectedVersion: 1,
    data
};

test("base repository owns not-found and conflict save errors", async () => {
    await expect(new TestRepository({ status: "not-found" }).save("missing", input))
        .rejects.toMatchObject<Partial<ResumeRepositoryError>>({ code: "not-found" });
    await expect(new TestRepository({ status: "conflict" }).save("stale", input))
        .rejects.toMatchObject<Partial<ResumeRepositoryError>>({ code: "conflict" });
});

test("local save cannot create a missing resume", async () => {
    localStorage.clear();
    const repository = new LocalStorageResumeRepository();

    await expect(repository.save("missing", input))
        .rejects.toMatchObject<Partial<ResumeRepositoryError>>({ code: "not-found" });
    expect(await repository.list()).toEqual([]);
});

test("local save rejects stale versions and updates the existing document", async () => {
    localStorage.clear();
    const repository = new LocalStorageResumeRepository();
    const created = await repository.create(input);

    await expect(repository.save(created.id, { ...input, expectedVersion: 7 }))
        .rejects.toMatchObject<Partial<ResumeRepositoryError>>({ code: "conflict" });

    const saved = await repository.save(created.id, { ...input, expectedVersion: 1 });
    expect(saved.id).toBe(created.id);
    expect(saved.version).toBe(2);
    expect((await repository.list())).toHaveLength(1);
});
