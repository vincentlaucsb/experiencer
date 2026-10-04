import { fireEvent, render, screen } from '@testing-library/react';
import HtmlIdAdder from '@/controls/HtmlIdAdder';

function openForm(props: Partial<React.ComponentProps<typeof HtmlIdAdder>> = {}) {
    // These callbacks are explicit ports supplied by consuming applications.
    const addHtmlId = jest.fn();
    const addCssClasses = jest.fn();
    render(<HtmlIdAdder addHtmlId={addHtmlId} addCssClasses={addCssClasses} {...props} />);
    fireEvent.click(screen.getByText('Add ID/Classes'));
    return { addHtmlId, addCssClasses };
}

test('preserves invalid input and prevents either field from saving', () => {
    const { addHtmlId, addCssClasses } = openForm();
    const id = screen.getByLabelText('ID') as HTMLInputElement;
    const classes = screen.getByLabelText('Classes');
    fireEvent.change(id, { target: { value: 'bad id#test' } });
    fireEvent.change(classes, { target: { value: 'a b#c' } });
    expect(id.value).toBe('bad id#test');
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect((screen.getByTestId('html-id-save') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.submit(screen.getByTestId('html-id-adder-form'));
    expect(addHtmlId).not.toHaveBeenCalled();
    expect(addCssClasses).not.toHaveBeenCalled();
    expect(screen.getByTestId('html-id-adder-form')).toBeTruthy();
    fireEvent.change(id, { target: { value: 'experience-section' } });
    expect((screen.getByTestId('html-id-save') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(classes, { target: { value: 'featured muted' } });
    fireEvent.submit(screen.getByTestId('html-id-adder-form'));
    expect(addHtmlId).toHaveBeenCalledWith('experience-section');
    expect(addCssClasses).toHaveBeenCalledWith('featured muted');
    expect(screen.queryByTestId('html-id-adder-form')).toBeNull();
});

test('validates existing props and allows removing both values', () => {
    const { addHtmlId, addCssClasses } = openForm({ htmlId: 'old#id', cssClasses: 'old#class' });
    expect((screen.getByTestId('html-id-save') as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Classes'), { target: { value: '' } });
    fireEvent.submit(screen.getByTestId('html-id-adder-form'));
    expect(addHtmlId).toHaveBeenCalledWith('');
    expect(addCssClasses).toHaveBeenCalledWith('');
});
