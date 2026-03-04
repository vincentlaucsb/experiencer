/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';

import useGoogleFontsStylesheet from '@/shared/hooks/useGoogleFontsStylesheet';

function HookHost({ stylesheet }: { stylesheet: string }) {
    useGoogleFontsStylesheet(stylesheet);
    return null;
}

describe('useGoogleFontsStylesheet', () => {
    beforeEach(() => {
        const existing = document.getElementById('template-google-fonts');
        existing?.remove();
    });

    test('creates Google Fonts link when stylesheet declares template fonts', () => {
        const stylesheet = `
            :root {
                --serif: Merriweather, serif;
            }
            #resume {
                font-family: var(--serif);
            }
        `;

        render(<HookHost stylesheet={stylesheet} />);

        const link = document.getElementById('template-google-fonts') as HTMLLinkElement | null;
        expect(link).not.toBeNull();
        expect(link?.href).toContain('https://fonts.googleapis.com/css?family=Merriweather&display=swap');
    });

    test('updates Google Fonts link when stylesheet fonts change', () => {
        const firstStylesheet = `
            #resume {
                font-family: Merriweather, serif;
            }
        `;

        const nextStylesheet = `
            #resume {
                font-family: Open Sans, sans-serif;
            }
        `;

        const { rerender } = render(<HookHost stylesheet={firstStylesheet} />);

        const link = document.getElementById('template-google-fonts') as HTMLLinkElement | null;
        expect(link?.href).toContain('family=Merriweather');

        rerender(<HookHost stylesheet={nextStylesheet} />);

        const updated = document.getElementById('template-google-fonts') as HTMLLinkElement | null;
        expect(updated?.href).toContain('family=Open+Sans');
        expect(updated?.href).not.toContain('family=Merriweather');
    });

    test('removes Google Fonts link when stylesheet has no custom fonts', () => {
        const withFonts = `
            #resume {
                font-family: Merriweather, serif;
            }
        `;

        const withoutFonts = `
            #resume {
                font-size: 12pt;
            }
        `;

        const { rerender } = render(<HookHost stylesheet={withFonts} />);
        expect(document.getElementById('template-google-fonts')).not.toBeNull();

        rerender(<HookHost stylesheet={withoutFonts} />);
        expect(document.getElementById('template-google-fonts')).toBeNull();
    });
});
