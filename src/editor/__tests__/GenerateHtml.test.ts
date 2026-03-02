import generateHtml from '@/editor/GenerateHtml';

describe('generateHtml', () => {
    test('includes Google Fonts link from stylesheet font declarations', () => {
        const stylesheet = `
            :root {
                --serif: Merriweather, serif;
            }
            #resume {
                font-family: var(--serif);
            }
        `;

        const html = generateHtml(stylesheet, '<div id="resume"></div>');

        expect(html).toContain('https://fonts.googleapis.com/css?family=Merriweather&display=swap');
    });

    test('omits Google Fonts link when no custom fonts are found', () => {
        const stylesheet = `
            #resume {
                font-size: 10pt;
            }
        `;

        const html = generateHtml(stylesheet, '<div id="resume"></div>');

        expect(html).not.toContain('fonts.googleapis.com');
    });
});
