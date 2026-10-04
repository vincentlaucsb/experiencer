// These names are used directly in authored selectors, so require identifiers
// that work without CSS escaping. Unicode names remain supported.
const cssIdentifier = /^(?:--|-?[_a-zA-Z\u0080-\u{10ffff}])[-_a-zA-Z0-9\u0080-\u{10ffff}]*$/u;

export function isCssIdentifier(value: string): boolean {
    return cssIdentifier.test(value);
}

export function getHtmlIdError(value: string): string | undefined {
    if (!value) return;
    if (value === 'resume') return 'The ID resume is reserved for the editor.';
    if (!isCssIdentifier(value)) {
        return 'Use one CSS identifier, such as experience-section, without # or spaces.';
    }
}

export function getCssClassesError(value: string): string | undefined {
    const names = value.split(/[\t\n\f\r ]+/).filter(Boolean);
    if (names.some(name => !isCssIdentifier(name))) {
        return 'Use CSS identifiers separated by spaces, such as featured muted, without . or #.';
    }
}
