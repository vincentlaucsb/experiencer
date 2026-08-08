import ResumeTemplates from '../ResumeTemplates';
import CssNode from '@/shared/CssTree';

describe('built-in templates', () => {
    test('declare only the curated local families needed by their CSS', () => {
        for (const template of Object.values(ResumeTemplates.templates)) {
            expect(template.fonts?.length).toBeGreaterThan(0);
            expect(template.fonts?.every((font) => font.provider === 'builtin')).toBe(true);
        }
    });

    test('Streamline keeps its header title at regular weight', () => {
        const stylesheet = CssNode.load(ResumeTemplates.templates.Streamline.builtinCss).stylesheet();

        expect(stylesheet).toContain('font-weight: 400;');
        expect(stylesheet).not.toMatch(/header hgroup > h1 \{[^}]*font-weight: 700;/s);
    });
});
