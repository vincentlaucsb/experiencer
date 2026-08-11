import { extractFontFamiliesFromCss, getGoogleFontsUrl } from '@/shared/utils/fonts';

describe('fonts utility', () => {
    test('extracts concrete font families from font-family declarations', () => {
        const stylesheet = `
            #resume {
                font-family: Merriweather, serif;
            }
            h2 {
                font-family: "Open Sans", sans-serif;
            }
        `;

        expect(extractFontFamiliesFromCss(stylesheet)).toEqual(['Merriweather', 'Open Sans']);
    });

    test('resolves css variables used by font-family', () => {
        const stylesheet = `
            :root {
                --serif: Merriweather, serif;
                --sans-serif: Open Sans, sans-serif;
            }
            #resume {
                font-family: var(--serif);
            }
            h2 {
                font-family: var(--sans-serif);
            }
        `;

        expect(extractFontFamiliesFromCss(stylesheet)).toEqual(['Merriweather', 'Open Sans']);
    });

    test('ignores common installed system families', () => {
        const stylesheet = `
            body {
                font-family: Arial, Helvetica, sans-serif;
            }
            h1 {
                font-family: "Segoe UI", "Helvetica Neue", Merriweather, serif;
            }
        `;

        expect(extractFontFamiliesFromCss(stylesheet)).toEqual(['Merriweather']);
    });

    test('builds a Google Fonts URL from families', () => {
        const url = getGoogleFontsUrl(['Merriweather', 'Open Sans']);

        expect(url).toBe('https://fonts.googleapis.com/css?family=Merriweather|Open+Sans&display=swap');
    });

    test('preserves registered font variants when building the stylesheet URL', () => {
        const url = getGoogleFontsUrl([{
            provider: 'google',
            family: 'Source Sans 3',
            variants: ['regular', '700']
        }]);

        expect(url).toBe('https://fonts.googleapis.com/css?family=Source+Sans+3:regular,700&display=swap');
    });

    test('returns empty URL for empty families', () => {
        expect(getGoogleFontsUrl([])).toBe('');
    });
});
