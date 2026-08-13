/**
 * @jest-environment jsdom
 */
import { render, fireEvent, getByText, getAllByText, act, screen, waitFor, within } from "@testing-library/react";
import Resume, { Resume as ResumeView } from "@/app/Resume";
import ResumeTemplates from "@/templates/ResumeTemplates";
import CssNode from "@/shared/CssTree";
import registerNodes from "@/resume/schema";
import { useEditorStore } from "@/shared/stores/editorStore";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { cssStore, rootCssStore } from "@/shared/stores/cssStoreHooks";
import { assignIds } from "@/shared/utils/assignIds";
import type { ResumeSaveData } from "@/types";
import type {
    ResumeDocument,
    ResumeDocumentSummary,
    ResumeRepository,
    SaveResumeDocumentInput
} from "@/shared/repositories/ResumeRepository";
import ResumeLibraryStore from "@/shared/stores/resumeLibraryStore";
import { workspaceStore } from "@/shared/stores/workspaceStore";

// Initialize the schema registry
registerNodes();

/**
 * Helper to load template data into stores for unit testing.
 * Initializes resumeNodeStore, cssStore, and rootCssStore directly.
 */
function setupResumeForTest(template: ResumeSaveData) {
    act(() => {
        resumeNodeStore.setNodes(assignIds(template.childNodes));
        rootCssStore.setCss(CssNode.load(template.rootCss));
        cssStore.setCss(CssNode.load(template.builtinCss));
    });
}

function renderTemplateSwitcher(createDocumentFromTemplate = jest.fn()) {
    return render(
        <ResumeView
            mode="changingTemplate"
            stylesheet=""
            tree={{ type: "Resume", uuid: "test-root", childNodes: [] }}
            createDocumentFromTemplate={createDocumentFromTemplate}
        />
    );
}

function createRepository(document: ResumeDocument): jest.Mocked<ResumeRepository> {
    let documents: ResumeDocumentSummary[] = [{
        id: document.id,
        title: document.title,
        schemaVersion: document.schemaVersion,
        version: document.version,
        updatedAt: document.updatedAt
    }];

    return {
        list: jest.fn(async () => documents),
        get: jest.fn(async (_id: string) => document),
        create: jest.fn(async (input: SaveResumeDocumentInput) => ({
            id: "created-resume",
            title: input.title,
            schemaVersion: input.schemaVersion,
            version: 1,
            updatedAt: document.updatedAt,
            data: input.data
        })),
        save: jest.fn(async (id: string, input: SaveResumeDocumentInput) => ({
            ...document,
            id,
            title: input.title,
            data: input.data
        })),
        rename: jest.fn(async (id: string, title: string) => ({
            ...documents[0],
            id,
            title
        })),
        delete: jest.fn(async (id: string) => {
            documents = documents.filter((item) => item.id !== id);
        }),
        getActiveId: jest.fn(async () => document.id),
        setActiveId: jest.fn(async (_id: string) => undefined)
    };
}

/**
 * Simulate selecting a resume node
 * @param next Next node to be selected
 */
const selectNode = async (next: HTMLElement) => {
    await act(async () => {
        fireEvent.click(next, {
            bubbles: true,
            cancelable: true,
        })
    });
};

// Test selecting an node
test('Resume Select Test', async () => {
    const tegridy = ResumeTemplates.templates.Integrity;
    setupResumeForTest(tegridy);

    const { container } = render(<Resume mode="normal" />);

    // Test Selection
    const header = getByText(container, 'Randy Marsh');
    await selectNode(header);

    const selected = container.querySelector("[data-selected]");
    expect(selected).not.toBeNull();

    if (selected) {
        const subtitle = selected.querySelector('h2.subtitle');
        expect(subtitle).not.toBeNull();
        if (subtitle) {
            expect(subtitle.innerHTML).toBe('Geologist and Innovator');
        }
    }
})

/** Select a node, and then select the node's parent */
test('Resume Select Parent + Child Test', async () => {
    const tegridy = ResumeTemplates.templates.Integrity;
    setupResumeForTest(tegridy);

    const { container } = render(<Resume mode="normal" />);

    // Select entry
    const entries = getAllByText(container, 'Tegridy Farms');
    const entryText = entries.filter((elem) => {
        return elem.classList.contains('field');
    })[0];

    const entry = entryText.closest('article.entry');
    expect(entry).not.toBeNull();

    if (!entry) {
        throw new Error('Expected semantic entry node to exist');
    }

    const entryUuid = entry.getAttribute('data-uuid');
    expect(entryUuid).not.toBeNull();

    await act(async () => {
        useEditorStore.getState().selectNode(entryUuid as string);
    });

    let selected = container.querySelector("[data-selected]");
    expect(selected).not.toBeNull();

    if (selected) {
        const title = selected.querySelector('h3.title .field-0');
        expect(title).not.toBeNull();
        if (title) {
            expect(title.innerHTML).toBe('Tegridy Farms');
        }
    }

    // Select parent section
    const sections = getAllByText(container, 'Experience');
    const section = sections.filter((elem) => {
        return !elem.classList.contains('tree-item-section');
    })[0];

    // Select section
    await selectNode(section);
    
    selected = container.querySelector("[data-selected]");
    expect(selected).not.toBeNull();

    if (selected) {
        expect(selected.tagName.toLowerCase()).toBe('section');
    }
})

test('CSS editor reopens for a new selected node of the same type', async () => {
    const tegridy = ResumeTemplates.templates.Integrity;
    setupResumeForTest(tegridy);

    const { container } = render(<Resume mode="normal" />);

    const experience = getAllByText(container, 'Experience').filter((elem) => {
        return !elem.classList.contains('tree-item-section');
    })[0];
    const education = getAllByText(container, 'Education').filter((elem) => {
        return !elem.classList.contains('tree-item-section');
    })[0];

    expect(experience).toBeTruthy();
    expect(education).toBeTruthy();

    await selectNode(experience);
    await selectNode(getByText(container, 'CSS'));

    const firstHeading = container.querySelector('.css-title-heading') as HTMLElement | null;
    expect(firstHeading).not.toBeNull();

    if (!firstHeading) {
        throw new Error('Expected CSS editor heading to exist');
    }

    await act(async () => {
        fireEvent.click(firstHeading, {
            bubbles: true,
            cancelable: true,
        });
    });

    expect(container.querySelector('.css-category-content')).toBeNull();

    await selectNode(education);

    expect(container.querySelector('.css-category-content')).not.toBeNull();
});

test('Template switcher previews the selected template', async () => {
    const view = renderTemplateSwitcher();
    const integrityOption = screen.getByText('Integrity').closest('.pure-menu-item');

    await waitFor(() => expect(screen.getByAltText('Integrity template preview')).toBeTruthy());
    expect(document.querySelector('style[data-resume-preview-builtin-fonts]')).toBeNull();
    expect(integrityOption?.classList.contains('pure-menu-selected')).toBe(true);

    await act(async () => {
        fireEvent.click(screen.getByText('Assured'));
    });

    expect(screen.getByAltText('Assured template preview')).toBeTruthy();
    expect(screen.queryByText('Randy Marsh')).toBeNull();
    expect(screen.getByText('Assured').closest('.pure-menu-item')
        ?.classList.contains('pure-menu-selected')).toBe(true);
    expect(integrityOption?.classList.contains('pure-menu-selected')).toBe(false);

    view.unmount();
    expect(document.getElementById('resume-preview-google-fonts')).toBeNull();
});

test('Template switcher only commits the selected template from the action button', async () => {
    const createDocumentFromTemplate = jest.fn();
    renderTemplateSwitcher(createDocumentFromTemplate);
    const useTemplateButton = screen.getByRole('button', { name: 'Use this Template' });

    await act(async () => {
        fireEvent.click(screen.getByText('Streamline'));
    });

    expect(createDocumentFromTemplate).not.toHaveBeenCalled();
    expect(useTemplateButton.classList.contains('pure-button-primary')).toBe(true);
    expect(useTemplateButton.classList.contains('template-selector-primary-action')).toBe(true);

    await act(async () => {
        fireEvent.click(useTemplateButton);
    });

    expect(createDocumentFromTemplate).toHaveBeenCalledWith('Streamline');
});

test('Template switcher supports additional groups, async previews, and independent use actions', async () => {
    const useCustomTemplate = jest.fn(async () => undefined);
    render(
        <ResumeView
            mode="changingTemplate"
            stylesheet=""
            tree={{ type: "Resume", uuid: "test-root", childNodes: [] }}
            additionalTemplateGroups={[{
                id: "saved-templates",
                heading: <span>My Templates</span>,
                templates: [{
                    id: "canonical",
                    title: "Canonical Resume",
                    loadPreview: async () => ResumeTemplates.templates.Assured,
                    use: useCustomTemplate
                }]
            }]}
        />
    );

    expect(screen.getByText("My Templates")).toBeTruthy();
    fireEvent.click(screen.getByText("Canonical Resume"));

    await waitFor(() => {
        expect(screen.getByLabelText("Canonical Resume template preview")).toBeTruthy();
    });
    expect(useCustomTemplate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Use this Template"));
    await waitFor(() => expect(useCustomTemplate).toHaveBeenCalledTimes(1));
});

test('Template switcher sorts templates alphabetically within each section', () => {
    render(
        <ResumeView
            mode="changingTemplate"
            stylesheet=""
            tree={{ type: "Resume", uuid: "test-root", childNodes: [] }}
            additionalTemplateGroups={[{
                id: "saved-templates",
                heading: <span>My Templates</span>,
                templates: [
                    { id: "zulu", title: "Zulu Resume", use: jest.fn() },
                    { id: "alpha", title: "Alpha Resume", use: jest.fn() }
                ]
            }]}
        />
    );

    const assured = screen.getByText('Assured');
    const integrity = screen.getByText('Integrity');
    const alpha = screen.getByText('Alpha Resume');
    const zulu = screen.getByText('Zulu Resume');

    expect(assured.compareDocumentPosition(integrity) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(alpha.compareDocumentPosition(zulu) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('Template switcher supports image-backed previews without loading template data', async () => {
    const usePreviewTemplate = jest.fn(async () => undefined);
    render(
        <ResumeView
            mode="changingTemplate"
            stylesheet=""
            tree={{ type: "Resume", uuid: "test-root", childNodes: [] }}
            additionalTemplateGroups={[{
                id: "preview-templates",
                heading: <span>Preview templates</span>,
                templates: [{
                    id: "locked",
                    title: "Locked Preview",
                    previewImage: "/template-previews/locked.png",
                    previewAlt: "Locked Preview screenshot",
                    previewLabel: "Premium preview only",
                    use: usePreviewTemplate,
                    useLabel: "Upgrade to use",
                    useDescription: "Unlock this template with the premium plan."
                }]
            }]}
        />
    );

    fireEvent.click(screen.getByText('Locked Preview'));

    await waitFor(() => {
        expect(screen.getByAltText('Locked Preview screenshot').getAttribute('src'))
            .toBe('/template-previews/locked.png');
    });
    expect(screen.getByRole('button', { name: 'Upgrade to use' })).toBeTruthy();
    expect(screen.getByText('Premium preview only')).toBeTruthy();
    expect(screen.getByText('Unlock this template with the premium plan.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to use' }));
    await waitFor(() => expect(usePreviewTemplate).toHaveBeenCalledTimes(1));
});

test('Template switcher renders an additional group empty state', () => {
    render(
        <ResumeView
            mode="changingTemplate"
            stylesheet=""
            tree={{ type: "Resume", uuid: "test-root", childNodes: [] }}
            additionalTemplateGroups={[{
                id: "saved-templates",
                heading: <span>My Templates</span>,
                templates: [],
                emptyState: <p>No custom templates yet</p>
            }]}
        />
    );

    expect(screen.getByText("My Templates")).toBeTruthy();
    expect(screen.getByText("No custom templates yet")).toBeTruthy();
});

test('Template switcher suspends and restores the active resume stylesheet', async () => {
    setupResumeForTest(ResumeTemplates.templates.Assured);

    const view = render(<Resume mode="changingTemplate" />);
    const editorStyle = document.querySelector<HTMLStyleElement>(
        "style[data-resume-editor-stylesheet]"
    );

    await waitFor(() => expect(editorStyle?.textContent).toBe(""));

    view.rerender(<Resume mode="normal" />);

    await waitFor(() => expect(editorStyle?.textContent).toContain("background: #e8e8e8"));
});

test('Template switcher uses a generated screenshot for built-in template previews', () => {
    const view = renderTemplateSwitcher();
    const preview = screen.getByAltText('Integrity template preview');

    expect(preview.getAttribute('src')).toBe('/template-previews/integrity.png');
    expect(view.container.querySelector('.template-preview-frame')).toBeNull();
    expect(view.container.querySelector('#resume')).toBeNull();
});

test('Deleting a resume requires confirmation in the app modal', async () => {
    const document: ResumeDocument = {
        id: "saved-resume",
        title: "Saved Resume",
        schemaVersion: 1,
        version: 2,
        updatedAt: "2026-07-25T12:00:00.000Z",
        data: ResumeTemplates.templates.Integrity
    };
    const repository = createRepository(document);
    const libraryStore = new ResumeLibraryStore(repository);

    render(<Resume mode="landing" resumeLibraryStore={libraryStore} />);

    await screen.findByText("Saved Resume");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    let dialog = screen.getByRole("dialog", { name: "Delete resume" });
    expect(within(dialog).getByText(/Saved Resume/)).toBeTruthy();
    expect(repository.delete).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Delete resume" })).toBeNull();
    expect(repository.delete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    dialog = screen.getByRole("dialog", { name: "Delete resume" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(repository.delete).toHaveBeenCalledWith("saved-resume"));
});

test('Landing suspends document-scoped navigation until a resume is opened', async () => {
    const document: ResumeDocument = {
        id: "saved-resume",
        title: "Saved Resume",
        schemaVersion: 1,
        version: 2,
        updatedAt: "2026-07-25T12:00:00.000Z",
        data: ResumeTemplates.templates.Integrity
    };
    const repository = createRepository(document);
    const libraryStore = new ResumeLibraryStore(repository);
    workspaceStore.reset();

    render(
        <Resume
            resumeLibraryStore={libraryStore}
            documentMenuItems={<button type="button">Document action</button>}
        />
    );

    await screen.findByText("Saved Resume");
    expect(screen.queryByRole("button", { name: "Document action" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Documents" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("button", { name: "Document action" });
    expect(screen.getByRole("button", { name: "Saved Resume" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Go to landing page" }));
    expect(screen.queryByRole("button", { name: "Document action" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Saved Resume" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Return to editing resume/ }));

    await screen.findByRole("button", { name: "Document action" });
    expect(repository.get).toHaveBeenCalledTimes(1);
});

test('uses the active resume name in the HTML title and follows renames', async () => {
    const originalTitle = document.title;
    document.title = 'Experiencer Pro';
    const documentSummary: ResumeDocumentSummary = {
        id: 'resume-1',
        title: 'My Awesome Resume',
        schemaVersion: 1,
        version: 1,
        updatedAt: '2026-07-30T00:00:00Z'
    };
    const view = render(
        <ResumeView
            mode="normal"
            stylesheet=""
            tree={{ type: "Resume", uuid: "test-root", childNodes: [] }}
            activeDocumentId={documentSummary.id}
            documents={[documentSummary]}
        />
    );

    await waitFor(() => {
        expect(document.title).toBe('My Awesome Resume | Experiencer Pro');
    });

    view.rerender(
        <ResumeView
            mode="normal"
            stylesheet=""
            tree={{ type: "Resume", uuid: "test-root", childNodes: [] }}
            activeDocumentId={documentSummary.id}
            documents={[{ ...documentSummary, title: 'Renamed Resume' }]}
        />
    );

    await waitFor(() => {
        expect(document.title).toBe('Renamed Resume | Experiencer Pro');
    });

    view.rerender(
        <ResumeView
            mode="landing"
            stylesheet=""
            tree={{ type: "Resume", uuid: "test-root", childNodes: [] }}
            documents={[{ ...documentSummary, title: 'Renamed Resume' }]}
        />
    );

    await waitFor(() => {
        expect(document.title).toBe('Experiencer Pro');
    });

    view.unmount();
    document.title = originalTitle;
});
