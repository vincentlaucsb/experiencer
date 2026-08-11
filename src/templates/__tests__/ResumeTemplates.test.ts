import ResumeTemplates from '../ResumeTemplates';
import CssNode from '@/shared/CssTree';

describe('built-in templates', () => {
    test('declare only the curated local families needed by their CSS', () => {
        for (const template of Object.values(ResumeTemplates.templates)) {
            expect(template.fonts?.length).toBeGreaterThan(0);
            expect(template.fonts?.every((font) => font.provider === 'builtin')).toBe(true);
        }
    });

    test('keep built-in template content in normal document flow', () => {
        for (const template of Object.values(ResumeTemplates.templates)) {
            const stylesheet = CssNode.load(template.builtinCss).stylesheet();
            expect(stylesheet).not.toMatch(/position:\s*(?:relative|absolute|fixed|sticky)/i);
        }
    });

    test('Streamline keeps its header title at regular weight', () => {
        const stylesheet = CssNode.load(ResumeTemplates.templates.Streamline.builtinCss).stylesheet();

        expect(stylesheet).toContain('font-weight: 400;');
        expect(stylesheet).not.toMatch(/header hgroup > h1 \{[^}]*font-weight: 700;/s);
    });

    test('Assured résumé and cover letter share the same header treatment', () => {
        const resumeStylesheet = CssNode.load(ResumeTemplates.templates.Assured.builtinCss).stylesheet();
        const coverLetterStylesheet = CssNode.load(ResumeTemplates.templates['Assured: Cover Letter'].builtinCss).stylesheet();

        for (const stylesheet of [resumeStylesheet, coverLetterStylesheet]) {
            expect(stylesheet).toContain('background: #e8e8e8;');
            expect(stylesheet).toContain('padding: var(--header-padding);');
            expect(stylesheet).toContain('grid-template-columns: minmax(0, 1fr) 24px;');
        }
        expect(resumeStylesheet).toContain('font-size: 17pt;');
        expect(resumeStylesheet).toContain('font-family: var(--serif);');
        expect(resumeStylesheet).toContain('font-family: var(--sans-serif);');
        expect(resumeStylesheet).not.toContain('font-size: 1.05em;');
        expect(resumeStylesheet).toContain('column-gap: var(--spacing);');
        expect(resumeStylesheet).toContain('padding-left: var(--spacing);');
        expect(coverLetterStylesheet).not.toContain('background: #eeeeee;');
    });

    test.each([
        ['Assured: Cover Letter', 'Joe Blow'],
        ['Integrity: Cover Letter', 'Randy Marsh'],
        ['Streamline: Cover Letter', 'Dinesh Chugtai']
    ])('%s includes a handwritten signature and typed-name fallback', (templateName, name) => {
        const template = ResumeTemplates.templates[templateName];
        const serialized = JSON.stringify(template);
        const stylesheet = CssNode.load(template.builtinCss).stylesheet();

        expect(serialized).toContain(`Handwritten signature of ${name}`);
        expect(serialized).toContain(name);
        expect(stylesheet).toContain('object-fit: contain;');
    });
});
