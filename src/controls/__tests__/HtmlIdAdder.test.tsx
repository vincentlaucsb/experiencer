/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';

import HtmlIdAdder from '@/controls/HtmlIdAdder';

jest.mock('react-tiny-popover', () => ({
    Popover: ({ children, content, isOpen }: { children: React.ReactNode; content: React.ReactNode; isOpen: boolean; }) => (
        <>
            {children}
            {isOpen ? content : null}
        </>
    )
}));

function renderHtmlIdAdder(props: Partial<React.ComponentProps<typeof HtmlIdAdder>> = {}) {
    const addHtmlId = props.addHtmlId ?? jest.fn();
    const addCssClasses = props.addCssClasses ?? jest.fn();

    render(
        <HtmlIdAdder
            addCssClasses={addCssClasses}
            addHtmlId={addHtmlId}
            cssClasses={props.cssClasses}
            htmlId={props.htmlId}
        />
    );

    return { addHtmlId, addCssClasses };
}

function openPopover() {
    fireEvent.click(screen.getByText('Add ID/Classes'));
}

describe('HtmlIdAdder', () => {
    test('shows a hash prefix next to the ID field', () => {
        renderHtmlIdAdder();

        openPopover();

        expect(screen.getByTestId('html-id-input')).toBeTruthy();
        expect(screen.getByTestId('html-id-prefix').textContent).toBe('#');
    });

    test('strips hash and spaces from the ID input before saving', () => {
        const { addHtmlId, addCssClasses } = renderHtmlIdAdder();

        openPopover();

        const idInput = screen.getByTestId('html-id-input') as HTMLInputElement;
        fireEvent.change(idInput, { target: { value: '#page two' } });

        expect(idInput.value).toBe('pagetwo');

        fireEvent.click(screen.getByTestId('html-id-save'));

        expect(addHtmlId).toHaveBeenCalledWith('pagetwo');
        expect(addCssClasses).toHaveBeenCalledWith('');
    });

    test('treats an empty ID as valid and saves removal', () => {
        const { addHtmlId } = renderHtmlIdAdder({ htmlId: 'page-two' });

        openPopover();

        const idInput = screen.getByTestId('html-id-input') as HTMLInputElement;
        fireEvent.change(idInput, { target: { value: '' } });

        expect(idInput.value).toBe('');
        expect(idInput.classList.contains('invalid')).toBe(false);

        fireEvent.click(screen.getByTestId('html-id-save'));

        expect(addHtmlId).toHaveBeenCalledWith('');
    });

    test('initializes ID and class values from props', () => {
        renderHtmlIdAdder({ htmlId: 'page-two', cssClasses: 'hero muted' });

        openPopover();

        expect((screen.getByTestId('html-id-input') as HTMLInputElement).value).toBe('page-two');
        expect((screen.getByTestId('css-classes-input') as HTMLInputElement).value).toBe('hero muted');
    });

    test('toggles the popover open and closed from the trigger', () => {
        renderHtmlIdAdder();

        expect(screen.queryByTestId('html-id-adder-form')).toBeNull();

        openPopover();
        expect(screen.getByTestId('html-id-adder-form')).toBeTruthy();

        openPopover();
        expect(screen.queryByTestId('html-id-adder-form')).toBeNull();
    });

    test('marks an invalid ID and does not submit it', () => {
        const { addHtmlId, addCssClasses } = renderHtmlIdAdder();

        openPopover();

        const idInput = screen.getByTestId('html-id-input') as HTMLInputElement;
        const classesInput = screen.getByTestId('css-classes-input') as HTMLInputElement;

        fireEvent.change(idInput, { target: { value: '[' } });
        fireEvent.change(classesInput, { target: { value: 'hero muted' } });
        fireEvent.click(screen.getByTestId('html-id-save'));

        expect(idInput.classList.contains('invalid')).toBe(true);
        expect(addHtmlId).not.toHaveBeenCalled();
        expect(addCssClasses).toHaveBeenCalledWith('hero muted');
    });

    test('marks invalid class selectors and still allows a valid ID to save', () => {
        const { addHtmlId, addCssClasses } = renderHtmlIdAdder();

        openPopover();

        const idInput = screen.getByTestId('html-id-input') as HTMLInputElement;
        const classesInput = screen.getByTestId('css-classes-input') as HTMLInputElement;

        fireEvent.change(idInput, { target: { value: 'page-two' } });
        fireEvent.change(classesInput, { target: { value: '[' } });
        fireEvent.click(screen.getByTestId('html-id-save'));

        expect(classesInput.classList.contains('invalid')).toBe(true);
        expect(addHtmlId).toHaveBeenCalledWith('page-two');
        expect(addCssClasses).not.toHaveBeenCalled();
    });

    test('closes the popover after save', () => {
        renderHtmlIdAdder();

        openPopover();
        fireEvent.click(screen.getByTestId('html-id-save'));

        expect(screen.queryByTestId('html-id-adder-form')).toBeNull();
    });
});