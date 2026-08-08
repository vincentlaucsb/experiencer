import { documentFontsStore, MAXIMUM_DOCUMENT_FONTS } from '../documentFontsStore';

beforeEach(() => {
    documentFontsStore.load(undefined);
});

test('keeps a document-scoped font manifest capped at ten families', () => {
    for (let index = 0; index < MAXIMUM_DOCUMENT_FONTS; index += 1) {
        expect(documentFontsStore.add({
            provider: 'google',
            family: `Font ${index}`,
            variants: ['regular', '700']
        })).toBe(true);
    }

    expect(documentFontsStore.add({ provider: 'google', family: 'Overflow' })).toBe(false);
    expect(documentFontsStore.data).toHaveLength(MAXIMUM_DOCUMENT_FONTS);
});

test('removing a registered family does not touch CSS or other families', () => {
    documentFontsStore.add({ provider: 'google', family: 'Roboto' });
    documentFontsStore.add({ provider: 'google', family: 'Merriweather' });

    expect(documentFontsStore.remove('roboto')).toBe(true);
    expect(documentFontsStore.data?.map((font) => font.family)).toEqual(['Merriweather']);
    expect(documentFontsStore.remove('missing')).toBe(false);
});

test('normalizes a Google registration to the local built-in source', () => {
    expect(documentFontsStore.add({ provider: 'google', family: 'Inter' })).toBe(true);
    expect(documentFontsStore.data).toEqual([
        { provider: 'builtin', family: 'Inter', category: 'sans-serif' }
    ]);
});
