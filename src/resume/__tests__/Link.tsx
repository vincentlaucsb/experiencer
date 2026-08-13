/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import Link from "@/resume/Link";
import { useEditorStore } from "@/shared/stores/editorStore";

afterEach(() => {
    useEditorStore.getState().unselectNode();
});

/** Verify the live editor exposes safe links without navigating on selection. */
test('Link renders as an anchor in the editor', () => {
    const { container } = render(
        <Link
            id={[0]}
            type={Link.type}
            uuid="test-uuid"
            isLast={false}
            updateData={() => { }}
            updateDataFields={() => { }}
            value="Test Link"
            url="https://example.com"
        />
    );

    const anchor = container.querySelector('a.link');
    expect(anchor).toBeTruthy();
    expect(anchor?.textContent).toBe('Test Link');
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
});

/** Verify Link displays default text when value is empty. */
test('Link shows default text when value is empty', () => {
    const { container } = render(
        <Link
            id={[0]}
            type={Link.type}
            uuid="test-uuid"
            isLast={false}
            updateData={() => { }}
            updateDataFields={() => { }}
            url="https://example.com"
        />
    );

    expect(container.querySelector('a.link')?.textContent).toBe('Link text');
});

/** Verify Link uses # as default href when url is empty. */
test('Link uses # as default href when url is empty', () => {
    const { container } = render(
        <Link
            id={[0]}
            type={Link.type}
            uuid="test-uuid"
            isLast={false}
            updateData={() => { }}
            updateDataFields={() => { }}
            value="Test Link"
        />
    );

    expect(container.querySelector('a.link')?.getAttribute('href')).toBe('#');
});

test.each([
    'javascript:alert(document.domain)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '/unexpected-relative-path',
])('Link replaces unsafe URL %s with a non-navigating target', (url) => {
    const { container } = render(
        <Link
            id={[0]}
            type={Link.type}
            uuid="test-uuid"
            isLast={false}
            updateData={() => { }}
            updateDataFields={() => { }}
            value="Test Link"
            url={url}
        />
    );

    expect(container.querySelector('a.link')?.getAttribute('href')).toBe('#');
});

test.each([
    'https://example.com',
    'http://example.com',
    'mailto:hello@example.com',
    'tel:+15555550123',
])('Link preserves supported URL %s', (url) => {
    const { container } = render(
        <Link
            id={[0]}
            type={Link.type}
            uuid="test-uuid"
            isLast={false}
            updateData={() => { }}
            updateDataFields={() => { }}
            value="Test Link"
            url={url}
        />
    );

    expect(container.querySelector('a.link')?.getAttribute('href')).toBe(url);
});

/** Verify Link enters edit mode when selected. */
test('Link shows input when in edit mode', () => {
    useEditorStore.getState().editNode('test-uuid');

    const { container } = render(
        <Link
            id={[0]}
            type={Link.type}
            uuid="test-uuid"
            isLast={false}
            updateData={() => { }}
            updateDataFields={() => { }}
            value="Test Link"
            url="https://example.com"
        />
    );

    const input = container.querySelector('.link-editing input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input?.value).toBe('Test Link');
});
