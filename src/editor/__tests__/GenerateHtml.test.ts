import generateHtml from '@/editor/GenerateHtml';

describe('generateHtml', () => {
    test('includes Google Fonts link from stylesheet font declarations', () => {
        const stylesheet = `
            :root {
                --serif: Merriweather, serif;
            }
            body {
                font-family: var(--serif);
            }
        `;

        const html = generateHtml(stylesheet, '<main></main>');

        expect(html).toContain('https://fonts.googleapis.com/css?family=Merriweather&display=swap');
    });

    test('omits Google Fonts link when no custom fonts are found', () => {
        const stylesheet = `
            body {
                font-size: 10pt;
            }
        `;

        const html = generateHtml(stylesheet, '<main></main>');

        expect(html).not.toContain('fonts.googleapis.com');
    });

    test('does not allow stylesheet content to terminate the style element', () => {
        const stylesheet = '</style><script>globalThis.compromised = true</script><style>';

        const html = generateHtml(stylesheet, '<main></main>');

        expect(html).not.toContain('</style><script>');
        expect(html).not.toContain('<script>globalThis.compromised');
        expect(html).toContain('\\3C /style>');
        expect(html.match(/<style\b/g)).toHaveLength(2);
        expect(html.match(/<\/style>/g)).toHaveLength(2);
        expect(html).toContain('id="resume-document-stylesheet"');
    });
    test('adapter body geometry has inline important precedence and cannot inject attributes', () => {
        const html = generateHtml('body {padding: 0 !important}', '<main>Content</main>', [], undefined,
            {'padding-top': '48px', '--test': '" onload="alert(1)'});
        const doc = new DOMParser().parseFromString(html, 'text/html');
        expect(doc.body.style.getPropertyValue('padding-top')).toBe('48px');
        expect(doc.body.style.getPropertyPriority('padding-top')).toBe('important');
        expect(doc.body.hasAttribute('onload')).toBe(false);
        expect(doc.querySelector('main')?.textContent).toBe('Content');
    });

});
