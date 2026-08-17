/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import ResumeLanding from '@/app/ResumeLanding';
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

const savedDocument: ResumeDocument = {
    id: 'saved-resume',
    title: 'Saved Resume',
    schemaVersion: 1,
    version: 2,
    updatedAt: '2026-08-16T12:00:00.000Z',
    data: ResumeTemplates.templates.Integrity
};

afterEach(() => {
    workspaceStore.reset();
});

test('returns to the suspended editing session from the landing action', () => {
    const workspace = new WorkspaceStore();
    const loadLocalDraft = jest.fn();
    const selectDocument = jest.fn();
    const coordinator = new ResumeAppCoordinator({ workspace, loadLocalDraft });

    workspace.openDocument('resume-1');
    workspace.showLanding();

    render(
        <ResumeLanding
            topNav={<header />}
            coordinator={coordinator}
            createResume={jest.fn()}
            hasSuspendedSession
            lastDocumentId="saved-resume"
            selectDocument={selectDocument}
        />
    );

    fireEvent.click(screen.getByRole('button', { name: /Return to editing resume/ }));

    expect(workspace.getSnapshot()).toEqual({
        mode: 'normal',
        activeDocumentId: 'resume-1'
    });
    expect(selectDocument).not.toHaveBeenCalled();
    expect(loadLocalDraft).not.toHaveBeenCalled();
});

test('opens the last persisted document when no session is suspended', async () => {
    const repository = createRepository(savedDocument);
    const library = new ResumeLibraryStore(repository);
    const loadLocalDraft = jest.fn();
    const coordinator = new ResumeAppCoordinator({
        workspace: new WorkspaceStore(),
        loadLocalDraft
    });

    await act(async () => {
        await library.selectDocument(savedDocument.id);
        workspaceStore.reset();
    });
    repository.get.mockClear();

    render(
        <ResumeLanding
            topNav={<header />}
            coordinator={coordinator}
            createResume={jest.fn()}
            documents={library.getSnapshot().documents}
            lastDocumentId={library.getSnapshot().activeDocumentId}
            selectDocument={library.selectDocument}
        />
    );

    fireEvent.click(screen.getByRole('button', { name: /Return to editing resume/ }));

    await waitFor(() => expect(repository.get).toHaveBeenCalledWith(savedDocument.id));
    expect(workspaceStore.getSnapshot()).toEqual({
        mode: 'normal',
        activeDocumentId: savedDocument.id
    });
    expect(loadLocalDraft).not.toHaveBeenCalled();
});

test('keeps document groups and actions generic for embedding products', () => {
    const copy = jest.fn();

    render(
        <ResumeLanding
            topNav={<header />}
            createResume={jest.fn()}
            documentActions={{
                'local:1': [{
                    id: 'copy',
                    label: 'Copy to cloud',
                    run: copy
                }]
            }}
            documentGroups={[
                { id: 'cloud', title: 'Cloud resumes', documentIds: ['cloud:1'] },
                { id: 'local', title: 'On this device', documentIds: ['local:1'] }
            ]}
            documents={[
                {
                    id: 'cloud:1',
                    title: 'Cloud Resume',
                    schemaVersion: 1,
                    version: 1,
                    updatedAt: '2026-07-28T00:00:00Z'
                },
                {
                    id: 'local:1',
                    title: 'Local Resume',
                    schemaVersion: 1,
                    version: 2,
                    updatedAt: '2026-07-28T00:00:00Z'
                }
            ]}
        />
    );

    expect(screen.getByRole('heading', { name: 'Cloud resumes' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'On this device' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Copy to cloud' }));
    expect(copy).toHaveBeenCalledTimes(1);
});
