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
    'fangsong'
]);

const GOOGLE_FONTS_BASE_URL = 'https://fonts.googleapis.com/css?family=';

function normalizeFamily(value: string): string {
    return value.replace(/^['"]+|['"]+$/g, '').trim();
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

export function getGoogleFontsUrl(fontFamilies: string[]): string {
    const uniqueFamilies = Array.from(new Set(fontFamilies.map((family) => family.trim()).filter(Boolean)));
    if (uniqueFamilies.length === 0) {
        return '';
    }

    const familyParam = uniqueFamilies
        .map((family) => encodeURIComponent(family).replace(/%20/g, '+'))
        .join('|');

    return `${GOOGLE_FONTS_BASE_URL}${familyParam}&display=swap`;
}

export function ensureGoogleFontsLink(fontFamilies: string[]) {
    if (typeof document === 'undefined') {
        return;
    }

    const href = getGoogleFontsUrl(fontFamilies);
    const existing = document.getElementById('template-google-fonts') as HTMLLinkElement | null;

    if (!href) {
        existing?.remove();
        return;
    }

    const link = existing ?? document.createElement('link');
    link.id = 'template-google-fonts';
    link.rel = 'stylesheet';
    link.href = href;

    if (!existing) {
        document.head.appendChild(link);
    }
}