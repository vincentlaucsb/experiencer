import { ResumeAppCoordinator } from '@/shared/services/ResumeAppCoordinator';
import type {
    ResumeDocument,
    ResumeRepository,
    SaveResumeDocumentInput
} from '@/shared/repositories/ResumeRepository';
import ResumeLibraryStore from '@/shared/stores/resumeLibraryStore';
import { workspaceStore, WorkspaceStore } from '@/shared/stores/workspaceStore';
import ResumeTemplates from '@/templates/ResumeTemplates';

function createRepository(document: ResumeDocument): jest.Mocked<ResumeRepository> {
    return {
        list: jest.fn(async () => [{
            id: document.id,
            title: document.title,
            schemaVersion: document.schemaVersion,
            version: document.version,
            updatedAt: document.updatedAt
        }]),
        get: jest.fn(async (_id: string) => document),
        create: jest.fn(async (input: SaveResumeDocumentInput) => ({
            ...document,
            id: 'created-resume',
            title: input.title,
            data: input.data
        })),
        save: jest.fn(async (id: string, input: SaveResumeDocumentInput) => ({
            ...document,
            id,
            title: input.title,
            data: input.data
        })),
        rename: jest.fn(async (id: string, title: string) => ({
            id,
            title,
            schemaVersion: document.schemaVersion,
            version: document.version,
            updatedAt: document.updatedAt
        })),
        delete: jest.fn(async (_id: string) => undefined),
        getActiveId: jest.fn(async () => document.id),
        setActiveId: jest.fn(async (_id: string) => undefined)
    };
}

function createSavedDocument(): ResumeDocument {
    return {
        id: 'saved-resume',
        title: 'Saved Resume',
        schemaVersion: 1,
        version: 2,
        updatedAt: '2026-08-16T12:00:00.000Z',
        data: ResumeTemplates.templates.Integrity
    };
}

afterEach(() => {
    workspaceStore.reset();
});

test('resumes a suspended editing session instead of opening another document', () => {
    const workspace = new WorkspaceStore();
    const loadLocalDraft = jest.fn();
    const selectDocument = jest.fn();
    const coordinator = new ResumeAppCoordinator({ workspace, loadLocalDraft });

    workspace.openDocument('resume-1');
    workspace.showLanding();

    coordinator.resumeFromLanding({
        hasSuspendedSession: true,
        lastDocumentId: 'saved-resume',
        selectDocument
    });

    expect(workspace.getSnapshot()).toEqual({
        mode: 'normal',
        activeDocumentId: 'resume-1'
    });
    expect(selectDocument).not.toHaveBeenCalled();
    expect(loadLocalDraft).not.toHaveBeenCalled();
});

test('opens the last persisted document when no session is suspended', async () => {
    const document = createSavedDocument();
    const repository = createRepository(document);
    const library = new ResumeLibraryStore(repository);
    const loadLocalDraft = jest.fn();
    const coordinator = new ResumeAppCoordinator({
        workspace: new WorkspaceStore(),
        loadLocalDraft
    });

    await library.selectDocument(document.id);
    workspaceStore.reset();
    repository.get.mockClear();

    await coordinator.resumeFromLanding({
        lastDocumentId: library.getSnapshot().activeDocumentId,
        selectDocument: library.selectDocument
    });

    expect(repository.get).toHaveBeenCalledWith(document.id);
    expect(workspaceStore.getSnapshot()).toEqual({
        mode: 'normal',
        activeDocumentId: document.id
    });
    expect(loadLocalDraft).not.toHaveBeenCalled();
});

test('does not fall through to a local draft when the last document has no opener', () => {
    const loadLocalDraft = jest.fn();
    const coordinator = new ResumeAppCoordinator({
        workspace: new WorkspaceStore(),
        loadLocalDraft
    });

    coordinator.resumeFromLanding({ lastDocumentId: 'saved-resume' });

    expect(loadLocalDraft).not.toHaveBeenCalled();
});

test('loads the legacy local draft when no session or document is available', () => {
    const loadLocalDraft = jest.fn();
    const coordinator = new ResumeAppCoordinator({
        workspace: new WorkspaceStore(),
        loadLocalDraft
    });

    coordinator.resumeFromLanding({});

    expect(loadLocalDraft).toHaveBeenCalledTimes(1);
});
