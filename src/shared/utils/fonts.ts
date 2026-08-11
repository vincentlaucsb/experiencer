import type { ResumeFont } from '@/types';

const GENERIC_FAMILIES = new Set([
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
    'ui-serif',
    'ui-sans-serif',
    'ui-monospace',
    'emoji',
    'math',
    'fangsong',
    // Installed system families should not be treated as document-managed web fonts.
    'arial',
    'helvetica',
    'helvetica neue',
    'times',
    'times new roman',
    'georgia',
    'verdana',
    'tahoma',
    'trebuchet ms',
    'courier',
    'courier new',
    'consolas',
    'lucida console',
    'monaco',
    'segoe ui',
    'calibri',
    'cambria',
    '-apple-system',
    'blinkmacsystemfont'
]);

const GOOGLE_FONTS_BASE_URL = 'https://fonts.googleapis.com/css?family=';

export type GoogleFontRequest = string | ResumeFont;

function normalizeFamily(value: string): string {
    return value.trim().replace(/^['"]+|['"]+$/g, '').trim();
}

function splitFamilies(value: string): string[] {
    return value
        .split(',')
        .map((entry) => normalizeFamily(entry))
        .filter(Boolean)
        .filter((entry) => !GENERIC_FAMILIES.has(entry.toLowerCase()));
}

function resolveCssVariable(value: string, variables: Map<string, string>): string {
    return value.replace(/var\(\s*--([\w-]+)\s*\)/g, (match, variableName: string) => {
        const resolved = variables.get(variableName);
        return resolved ?? match;
    });
}

export function extractFontFamiliesFromCss(stylesheet: string): string[] {
    if (!stylesheet) {
        return [];
    }

    const cssVariables = new Map<string, string>();
    const variableRegex = /--([\w-]+)\s*:\s*([^;}{]+);/g;

    let variableMatch: RegExpExecArray | null;
    while ((variableMatch = variableRegex.exec(stylesheet)) !== null) {
        cssVariables.set(variableMatch[1], variableMatch[2].trim());
    }

    const families = new Set<string>();
    const fontFamilyRegex = /font-family\s*:\s*([^;}{]+);/g;
    let fontMatch: RegExpExecArray | null;

    while ((fontMatch = fontFamilyRegex.exec(stylesheet)) !== null) {
        const resolved = resolveCssVariable(fontMatch[1], cssVariables);
        splitFamilies(resolved).forEach((family) => families.add(family));
    }

    return Array.from(families);
}

export function getGoogleFontsUrl(fontFamilies: GoogleFontRequest[]): string {
    const uniqueFamilies: GoogleFontRequest[] = [];
    for (const family of fontFamilies) {
        const name = typeof family === 'string' ? family.trim() : family.family.trim();
        if (!name || uniqueFamilies.some((item) => {
            const other = typeof item === 'string' ? item : item.family;
            return other.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0;
        })) {
            continue;
        }
        uniqueFamilies.push(typeof family === 'string' ? name : { ...family, family: name });
    }
    if (uniqueFamilies.length === 0) {
        return '';
    }

    const familyParam = uniqueFamilies
        .map((family) => {
            if (typeof family === 'string') {
                return encodeURIComponent(family).replace(/%20/g, '+');
            }
            const variants = family.variants?.filter(Boolean).join(',');
            const suffix = variants ? `:${variants}` : '';
            return `${encodeURIComponent(family.family).replace(/%20/g, '+')}${suffix}`;
        })
        .join('|');

    return `${GOOGLE_FONTS_BASE_URL}${familyParam}&display=swap`;
}

export function ensureGoogleFontsLink(
    fontFamilies: GoogleFontRequest[],
    targetDocument: Document | undefined = typeof document === 'undefined'
        ? undefined
        : document,
    linkId = 'template-google-fonts'
) {
    if (!targetDocument) {
        return;
    }

    const href = getGoogleFontsUrl(fontFamilies);
    const existing = targetDocument.getElementById(linkId) as HTMLLinkElement | null;

    if (!href) {
        existing?.remove();
        return;
    }

    const link = existing ?? targetDocument.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = href;

    if (!existing) {
        targetDocument.head.appendChild(link);
    }
}
