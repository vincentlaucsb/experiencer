import ResumeTemplates, { createResumeTemplates } from '../ResumeTemplates';
import { resumeBodyBaseProperties } from '../CssTemplates';
import { builtinTemplateThemes } from '../builtinTemplateThemes';
import { applyTemplateTheme } from '@/shared/templates/templateTheme';
import CssNode from '@/shared/CssTree';
import type { BasicResumeNode } from '@/types';

// Enumerates the catalog rather than naming templates, so a newly registered template or theme is covered automatically.
const catalogDocuments = Object.entries(createResumeTemplates()).flatMap(([name, template]) => [
    [name, template] as const,
    ...(builtinTemplateThemes[name] ?? []).map((theme) => [`${name} (${theme.name})`, applyTemplateTheme(template, theme)] as const)
]);

describe('every built-in template document', () => {
    test('is enumerated from the catalog', () => {
        expect(catalogDocuments.length).toBeGreaterThan(Object.keys(createResumeTemplates()).length);
    });

    test.each(catalogDocuments)('%s keeps the shared résumé body base properties', (_name, template) => {
        const body = CssNode.load(template.builtinCss);
        expect(body.selector).toBe('body');
        for (const [property, value] of Object.entries(resumeBodyBaseProperties)) {
            expect(body.properties.get(property)).toBe(value);
        }
    });

    test.each(catalogDocuments)('%s does not reset the base properties on every element', (_name, template) => {
        // Any universal rule, scoped or not, would silently undo the body base; overrides must name an element or class.
        const universalRules: CssNode[] = [];
        const collect = (node: CssNode) => {
            if (node.selector.split(',').some((part) => /\*(::?[\w-]+)?$/.test(part.trim()))) universalRules.push(node);
            node.children.forEach(collect);
        };
        collect(CssNode.load(template.builtinCss));
        for (const rule of universalRules) {
            for (const property of Object.keys(resumeBodyBaseProperties)) {
                expect(rule.properties.has(property)).toBe(false);
            }
        }
    });
});

describe('built-in templates', () => {
    test('allows development renderers to inject a deterministic cover-letter date', () => {
        const templates = createResumeTemplates('January 2, 2030');
        for (const name of [
            'Assured: Cover Letter',
            'Candor: Cover Letter',
            'Integrity: Cover Letter',
            'Streamline: Cover Letter'
        ] as const) {
            expect(JSON.stringify(templates[name].childNodes)).toContain('January 2, 2030');
        }
    });

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
            expect(stylesheet).not.toContain('#resume');
        }
    });

    test('Streamline résumé and cover letter share the regular-weight header treatment', () => {
        const resumeCss = CssNode.load(ResumeTemplates.templates.Streamline.builtinCss);
        const coverLetterCss = CssNode.load(ResumeTemplates.templates['Streamline: Cover Letter'].builtinCss);
        const resumeStylesheet = resumeCss.stylesheet();
        const coverLetterStylesheet = coverLetterCss.stylesheet();

        for (const stylesheet of [resumeStylesheet, coverLetterStylesheet]) {
            expect(stylesheet).toContain('font-size: var(--header-title-size);');
            expect(stylesheet).toContain('font-weight: 400;');
            expect(stylesheet).not.toMatch(/header hgroup > h1 \{[^}]*font-weight: 700;/s);
        }
        for (const css of [resumeCss, coverLetterCss]) {
            const separator = css.findNode(['Header', '#contact', 'Contact Row', 'Contact Row Separators']);
            expect(separator?.properties.get('display')).toBe('inline-block');
            expect(separator?.properties.get('content')).toBe('""');
            expect(separator?.properties.get('background')).toBe('currentColor');
            expect(separator?.properties.get('border-radius')).toBe('50%');
            expect(separator?.properties.get('width')).toBe('var(--separator-size)');
            expect(separator?.properties.get('height')).toBe('var(--separator-size)');
            expect(separator?.properties.has('text-decoration')).toBe(false);
        }
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

    test('Integrity draws timeline dots as empty boxes and writes date ranges with em dashes', () => {
        const template = ResumeTemplates.templates.Integrity;
        const css = CssNode.load(template.builtinCss);
        const marker = css.findNode(['Section', 'Grid', 'Entry', 'Title', 'Timeline Marker']);
        const firstDateLine = css.findNode(['Section', 'Grid', 'Dates', 'First Line']);

        for (const component of ['Entry', 'Section', 'Grid', 'Markdown']) {
            expect(css.findNode(component)).toBeDefined();
        }
        expect(firstDateLine?.fullSelector).toBe('body section .grid-container > .text-content > :first-child');
        expect(firstDateLine?.properties.get('margin-top')).toBe('0');
        expect(marker?.fullSelector).toBe('body section .grid-container .entry > hgroup > h3:not(:empty)::before');
        expect(marker?.properties.get('content')).toBe('""');
        expect(marker?.properties.get('display')).toBe('inline-block');
        expect(marker?.properties.get('border-radius')).toBe('50%');
        expect(marker?.properties.get('print-color-adjust')).toBe('exact');
        expect(JSON.stringify(template.childNodes)).toContain('2019 — Present');
        expect(JSON.stringify(template.childNodes)).not.toContain(' -- ');
    });

    test.each([
        ['Assured: Cover Letter', 'Joe Blow'],
        ['Candor: Cover Letter', 'Bea Spoke'],
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

    describe('Candor', () => {
        const nodeTypes = (nodes: BasicResumeNode[] = []): string[] =>
            nodes.flatMap(node => [node.type, ...nodeTypes(node.childNodes)]);

        test.each(['Candor', 'Candor: Cover Letter'])('%s reads the main column before the right rail', (name) => {
            const [main, rail] = ResumeTemplates.templates[name].childNodes;
            expect(main.htmlId).toBe('candor-main');
            expect(rail.htmlId).toBe('candor-rail');
            expect(main.childNodes?.[0].type).toBe('Header');
            expect(rail.childNodes?.[0].htmlId).toBe('candor-contact');

            const stylesheet = CssNode.load(ResumeTemplates.templates[name].builtinCss).stylesheet();
            expect(stylesheet).toMatch(/body \{[^}]*grid-template-columns: minmax\(0, 1fr\) var\(--rail-width\);/s);
        });

        test('the résumé is headshot-free and uses reserved example contact domains', () => {
            const template = ResumeTemplates.templates.Candor;
            expect(nodeTypes(template.childNodes)).not.toContain('Image');
            const serialized = JSON.stringify(template.childNodes);
            expect(serialized).toContain('bea.spoke@mail.example');
            expect(serialized).toMatch(/linkedin\.com\/in\/[a-z-]+-example/);
        });

        test('draws timeline markers and section rules as empty pseudo-elements', () => {
            const css = CssNode.load(ResumeTemplates.templates.Candor.builtinCss);
            const marker = css.findNode(['Section', 'Content', 'Timeline Markers']);
            const rule = css.findNode(['Section', 'Title', 'Title Rule']);
            for (const node of [marker, rule]) {
                expect(node?.properties.get('content')).toBe('""');
                expect(node?.properties.get('print-color-adjust')).toBe('exact');
            }
            expect(marker?.fullSelector).toBe('body section > div.content .entry > hgroup > h3::before');
            expect(css.findNode(['Rail', 'Rail Sections', 'Rail Section Content'])?.properties.get('border')).toBe('0');
            const railMarker = css.findNode(['Rail', 'Rail Sections', 'Rail Section Content', 'Rail Entry Markers']);
            expect(railMarker?.properties.get('display')).toBe('none');
            expect(railMarker?.fullSelector).toBe('body #candor-rail section > .content .entry > hgroup > h3::before');
        });

        test('keeps the date at the right of the primary entry title row', () => {
            const css = CssNode.load(ResumeTemplates.templates.Candor.builtinCss);
            const title = css.findNode(['Entry', 'Title Block', 'Title']);
            expect(title?.properties.get('display')).toBe('flex');
            expect(title?.findNode('Last Field')?.properties.get('margin-left')).toBe('auto');
        });

        test('the cover letter shares the palette and carries the application reference in its rail', () => {
            const resume = ResumeTemplates.templates.Candor;
            const letter = createResumeTemplates('January 2, 2030')['Candor: Cover Letter'];
            expect(letter.rootCss).toEqual(resume.rootCss);

            const rail = letter.childNodes[1];
            const application = rail.childNodes?.find(node => node.value === 'Application');
            const terms = application?.childNodes?.[0].childNodes?.map(item => [item.value, (item as { definitions?: string[] }).definitions]);
            expect(terms).toEqual([
                ['Date', ['January 2, 2030']],
                ['Position', ['Senior Product Designer']],
                ['Company', ['Brightpath Health']]
            ]);

            const signature = CssNode.load(letter.builtinCss).findNode(['Main Column', 'Letter', 'Letter Signature']);
            expect(signature?.properties.get('break-inside')).toBe('avoid');
        });

        test('uses one root font size and palettes that change only existing variables', () => {
            const root = CssNode.load(ResumeTemplates.templates.Candor.rootCss);
            expect(root.properties.get('--font-size')).toBe('10pt');
            expect(root.properties.has('--small-spacing')).toBe(true);
            for (const theme of builtinTemplateThemes.Candor) {
                const themed = CssNode.load(applyTemplateTheme(ResumeTemplates.templates.Candor, theme).rootCss);
                expect([...themed.properties.keys()]).toEqual([...root.properties.keys()]);
            }
        });
    });
});
