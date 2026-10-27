import PageSize from '@/types/PageSize';
import { getResumePrintGeometry } from '@/shared/utils/resumePrintGeometry';

beforeEach(() => { document.body.replaceChildren(); document.body.style.cssText = 'margin:0; padding:0; min-height:2112px;'; });
afterEach(() => { document.body.replaceChildren(); document.body.removeAttribute('style'); });

test('repeated page insets occupy part of a nested continuation canvas rather than an extra page', () => {
    document.body.style.padding = '48px 24px';
    document.body.innerHTML = '<div class="grid-container"><div class="column"><div class="page-break"></div></div></div>';
    const geometry = getResumePrintGeometry(document.body, PageSize.Letter);
    expect(geometry['min-height']).toBe('2016px');
    expect(geometry['padding-top']).toBe('48px');
    expect(geometry['padding-bottom']).toBe('48px');
    expect(geometry['box-decoration-break']).toBe('clone');
    expect(document.body.style.minHeight).toBe('2112px');
});

test.each([
    '<div class="column"><div class="page-break"></div></div>',
    '<div class="grid-container"><div class="column">Continuous content</div></div>',
    '<div class="page-break"></div>'
])('native direct-grid and ordinary flows do not retain the screen canvas minimum', markup => {
    document.body.innerHTML = markup;
    expect(getResumePrintGeometry(document.body, PageSize.Letter)['min-height']).toBe('0px');
});

test('authored vertical margins join padding as repeated print insets', () => {
    document.body.style.margin = '12px 0 24px';
    document.body.style.padding = '36px 0 24px';
    document.body.innerHTML = '<div class="grid-container"><div class="column"><div class="page-break"></div></div></div>';
    const geometry = getResumePrintGeometry(document.body, PageSize.Letter);
    expect(geometry['min-height']).toBe('2016px');
    expect(geometry['padding-top']).toBe('48px');
    expect(geometry['padding-bottom']).toBe('48px');
    expect(geometry['margin-top']).toBe('0');
});
