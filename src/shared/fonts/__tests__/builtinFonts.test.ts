import { getBuiltinFont, getBuiltinFontStylesheet, getGoogleFontRequests } from '../builtinFonts';
import { createResumeDocumentSource, prepareResumeDocument, type ResumeRenderTarget } from '@/shared/resumeDocument/prepareResumeDocument';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';
import type { ResumeSaveData } from '@/types';

const selected = { provider: 'builtin' as const, family: 'CMU Serif', category: 'serif' };

test('CMU Serif registers locally and supplies four original OpenType faces only when selected', () => {
    const font = getBuiltinFont('cmu serif')!;
    expect(font.faces.map(face => [face.style, face.weight])).toEqual([
        ['normal', '400'], ['normal', '700'], ['italic', '400'], ['italic', '700']
    ]);
    expect(font.licenseUrl).toBe('/fonts/builtin/licenses/cmu-serif.txt');
    expect(getBuiltinFontStylesheet(undefined)).toBe('');
    expect(getBuiltinFontStylesheet([selected])).toContain("format('opentype')");
    expect(getGoogleFontRequests([selected])).toEqual([]);
    documentFontsStore.load(undefined);
    expect(documentFontsStore.add(selected)).toBe(true);
    expect(documentFontsStore.data).toEqual([selected]);
    documentFontsStore.load(undefined);
});

test.each<ResumeRenderTarget>(['editor', 'isolated-preview', 'standalone-preview', 'print', 'export', 'png', 'render-service', 'public-review'])(
    'canonical %s preparation retains the local font and authored fallback', target => {
        const data: ResumeSaveData = {
            builtinCss: { name: 'Body', selector: 'body', properties: [['font-family', '"CMU Serif", serif']], children: [] },
            rootCss: { name: 'Root', selector: ':root', properties: [], children: [] },
            childNodes: [{ type: 'Markdown', value: 'Synthetic CMU specimen' }], fonts: [selected]
        };
        const prepared = prepareResumeDocument(createResumeDocumentSource(data, 'CMU specimen'), target);
        expect(prepared.fonts).toEqual([selected]);
        expect(prepared.stylesheet).toContain('"CMU Serif", serif');
        expect(getBuiltinFontStylesheet(prepared.fonts)).toContain('cmu-serif-cmunbi.otf');
    }
);
