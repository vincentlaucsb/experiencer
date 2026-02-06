/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import Link from "../Link";
import React from "react";
import ResumeContext, { IResumeContext } from "../ResumeContext";

/** Verify Link renders as span in editor mode */
test('Link renders as span when not printing', () => {
    const contextValue: IResumeContext = {
        isPrinting: false,
        selectedUuid: '',
        isEditingSelected: false,
        updateSelectedRef: () => {},
        updateClicked: () => {}
    };

    const { container } = render(
        <ResumeContext.Provider value={contextValue}>
            <Link
                id={[0]}
                type={Link.type}
                uuid="test-uuid"
                isLast={false}
                updateData={() => { }}
                value="Test Link"
                url="https://example.com"
            />
        </ResumeContext.Provider>
    );

    const span = container.querySelector('span.link');
    expect(span).toBeTruthy();
    expect(span?.textContent).toBe('Test Link');
    
    // Should NOT be an anchor tag
    const anchor = container.querySelector('a');
    expect(anchor).toBeNull();
});

/** Verify Link renders as <a> tag when printing */
test('Link renders as anchor tag when isPrinting is true', () => {
    const contextValue: IResumeContext = {
        isPrinting: true,
        selectedUuid: '',
        isEditingSelected: false,
        updateSelectedRef: () => {},
        updateClicked: () => {}
    };

    const { container } = render(
        <ResumeContext.Provider value={contextValue}>
            <Link
                id={[0]}
                type={Link.type}
                uuid="test-uuid"
                isLast={false}
                updateData={() => { }}
                value="Test Link"
                url="https://example.com"
            />
        </ResumeContext.Provider>
    );

    const anchor = container.querySelector('a.link');
    expect(anchor).toBeTruthy();
    expect(anchor?.textContent).toBe('Test Link');
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
});

/** Verify Link displays default text when value is empty */
test('Link shows default text when value is empty', () => {
    const contextValue: IResumeContext = {
        isPrinting: false,
        selectedUuid: '',
        isEditingSelected: false,
        updateSelectedRef: () => {},
        updateClicked: () => {}
    };

    const { container } = render(
        <ResumeContext.Provider value={contextValue}>
            <Link
                id={[0]}
                type={Link.type}
                uuid="test-uuid"
                isLast={false}
                updateData={() => { }}
                url="https://example.com"
            />
        </ResumeContext.Provider>
    );

    const span = container.querySelector('span.link');
    expect(span?.textContent).toBe('Link text');
});

/** Verify Link uses # as default href when url is empty */
test('Link uses # as default href when url is empty in print mode', () => {
    const contextValue: IResumeContext = {
        isPrinting: true,
        selectedUuid: '',
        isEditingSelected: false,
        updateSelectedRef: () => {},
        updateClicked: () => {}
    };

    const { container } = render(
        <ResumeContext.Provider value={contextValue}>
            <Link
                id={[0]}
                type={Link.type}
                uuid="test-uuid"
                isLast={false}
                updateData={() => { }}
                value="Test Link"
            />
        </ResumeContext.Provider>
    );

    const anchor = container.querySelector('a.link');
    expect(anchor?.getAttribute('href')).toBe('#');
});
