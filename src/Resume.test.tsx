/**
 * @jest-environment jsdom
 */
import { render, fireEvent, getByText, getByTitle, getAllByText, act, wait } from "@testing-library/react";
import Resume from "./Resume";
import React from "react";
import ResumeTemplates from "./components/templates/ResumeTemplates";
import CssNode from "./components/utility/CssTree";

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

    const { container } = render(<Resume
        mode="normal"
        nodes={tegridy.childNodes}
        css={CssNode.load(tegridy.builtinCss)}
        rootCss={CssNode.load(tegridy.rootCss)}
    />);

    // Test Selection
    const header = getByText(container, 'Randy Marsh');
    await selectNode(header);

    const selected = container.querySelector("[data-selected='true']");
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

    const { container } = render(<Resume
        mode="normal"
        nodes={tegridy.childNodes}
        css={CssNode.load(tegridy.builtinCss)}
        rootCss={CssNode.load(tegridy.rootCss)}
    />);

    // Select entry
    const entries = getAllByText(container, 'Tegridy Farms');
    let entry = entries.filter((elem) => {
        return elem.classList.contains('field');
    })[0];

    await selectNode(entry);

    let selected = container.querySelector("[data-selected='true']");
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
    
    selected = container.querySelector("[data-selected='true']");
    expect(selected).not.toBeNull();

    if (selected) {
        expect(selected.tagName.toLowerCase()).toBe('section');
    }
})