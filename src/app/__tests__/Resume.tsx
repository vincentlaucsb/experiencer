/**
 * @jest-environment jsdom
 */
import { render, fireEvent, getByText, getAllByText, act, screen } from "@testing-library/react";
import Resume, { Resume as ResumeView } from "@/app/Resume";
import ResumeTemplates from "@/templates/ResumeTemplates";
import CssNode from "@/shared/CssTree";
import registerNodes from "@/resume/schema";
import { useEditorStore } from "@/shared/stores/editorStore";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { cssStore, rootCssStore } from "@/shared/stores/cssStoreHooks";
import { assignIds } from "@/shared/utils/assignIds";
import type { ResumeSaveData } from "@/types";

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

    const entry = entryText.closest('resume-entry');
    expect(entry).not.toBeNull();

    if (!entry) {
        throw new Error('Expected resume-entry node to exist');
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

    expect(screen.getByLabelText('Integrity template preview')).toBeTruthy();
    expect(screen.getByText('Randy Marsh')).toBeTruthy();
    expect(document.getElementById('resume-preview-google-fonts')).not.toBeNull();

    await act(async () => {
        fireEvent.click(screen.getByText('Assured'));
    });

    expect(screen.getByLabelText('Assured template preview')).toBeTruthy();
    expect(screen.getByRole('heading', { name: /\*\*Solid\*\* Programmer/ })).toBeTruthy();
    expect(screen.queryByText('Randy Marsh')).toBeNull();

    view.unmount();
    expect(document.getElementById('resume-preview-google-fonts')).toBeNull();
});

test('Template switcher only commits the selected template from the action button', async () => {
    const createDocumentFromTemplate = jest.fn();
    renderTemplateSwitcher(createDocumentFromTemplate);

    await act(async () => {
        fireEvent.click(screen.getByText('Streamline'));
    });

    expect(createDocumentFromTemplate).not.toHaveBeenCalled();

    await act(async () => {
        fireEvent.click(screen.getByText('Use this Template'));
    });

    expect(createDocumentFromTemplate).toHaveBeenCalledWith('Streamline');
});
