import CssNode from '@/shared/CssTree';
import { applyTemplateTheme } from '@/shared/templates/templateTheme';
import { builtinTemplateThemes } from '../builtinTemplateThemes';
import ResumeTemplates from '../ResumeTemplates';
import { TemplateSelectorStore } from '@/shared/stores/templateSelectorStore';

test.each(Object.entries(builtinTemplateThemes))('%s palettes preserve content and default CSS', (name, themes) => {
    const original = ResumeTemplates.templates[name];
    const before = JSON.stringify(original);
    for (const theme of themes) {
        const result = applyTemplateTheme(original, theme);
        expect(result.childNodes).toEqual(original.childNodes);
        expect(Object.keys(result)).toEqual(Object.keys(original));
        expect(CssNode.load(result.rootCss).stylesheet()).not.toContain('#resume');
        expect(result).toEqual(applyTemplateTheme(original, theme));
    }
    expect(JSON.stringify(original)).toBe(before);
    expect(applyTemplateTheme(original, themes[0])).toEqual(original);
});

test('switching themes starts from defaults and creation receives only document data', async () => {
    let created;
    const store = new TemplateSelectorStore((_key, data) => { created = data; });
    store.selectBuiltIn('Integrity');
    store.selectTheme('plum');
    store.selectTheme('ocean');
    const expected = applyTemplateTheme(ResumeTemplates.templates.Integrity, builtinTemplateThemes.Integrity[1]);
    expect(store.getSnapshot().preview.data).toEqual(expected);
    await store.useSelected();
    expect(created).toEqual(expected);
    store.selectTheme('original');
    expect(store.getSnapshot().preview.data).toEqual(ResumeTemplates.templates.Integrity);
});

test('a transform can change selectors and declarations in both CSS trees', () => {
    const result = applyTemplateTheme(ResumeTemplates.templates.Assured, {
        id: 'arbitrary', name: 'Arbitrary', fill: 'linear-gradient(red, blue)',
        transform: css => {
            css.builtinCss.addNode('Theme rule', { 'letter-spacing': '0.01em' }, '.entry');
            css.rootCss.addNode('Print rule', { color: 'black' }, 'body');
            return css;
        }
    });
    expect(CssNode.load(result.builtinCss).stylesheet()).toContain('letter-spacing: 0.01em');
    expect(CssNode.load(result.rootCss).stylesheet()).toContain('color: black');
});


test('a refreshed option preserves the selected palette and uses the refreshed default document', async () => {
    const store = new TemplateSelectorStore(() => undefined);
    const configure = (data: typeof ResumeTemplates.templates.Integrity) => store.configure({ groups: [{
        id: 'extra', templates: [{ id: 'styled', themes: builtinTemplateThemes.Integrity,
            loadPreview: async () => data, use: () => undefined }]
    }] });
    configure(ResumeTemplates.templates.Integrity);
    store.selectAdditional('extra', 'styled');
    await Promise.resolve();
    store.selectTheme('plum');
    const refreshed = { ...ResumeTemplates.templates.Integrity, childNodes: [] };
    configure(refreshed);
    await Promise.resolve();
    expect(store.getSnapshot().selectedThemeId).toBe('plum');
    expect(store.getSnapshot().preview.data).toEqual(applyTemplateTheme(refreshed, builtinTemplateThemes.Integrity[3]));
    store.selectAdditional('extra', 'styled');
    await Promise.resolve();
    expect(store.getSnapshot().selectedThemeId).toBe('original');
});
