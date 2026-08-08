import type { ResumeFont } from '@/types';
import { BUILTIN_FONT_CATALOG } from '@/assets/fonts/builtinFonts.generated';
import type { GoogleFontRequest } from '@/shared/utils/fonts';

export interface BuiltinFontFace {
    css: string;
    style: string;
    weight: string;
}

export interface BuiltinFontDefinition extends ResumeFont {
    provider: 'builtin';
    faces: BuiltinFontFace[];
}

const definitions = new Map(
    BUILTIN_FONT_CATALOG.map((font) => [font.family.toLocaleLowerCase(), font])
);

/** Resolves curated local font assets without making the built-in catalog global. */
export function getBuiltinFont(family: string): BuiltinFontDefinition | undefined {
    return definitions.get(family.trim().toLocaleLowerCase());
}

export function isBuiltinFontFamily(family: string): boolean {
    return Boolean(getBuiltinFont(family));
}

/** Returns only the local @font-face rules selected by the current document. */
export function getBuiltinFontStylesheet(fonts: ResumeFont[] | undefined): string {
    return (fonts ?? [])
        .filter((font) => font.provider === 'builtin')
        .map((font) => getBuiltinFont(font.family))
        .filter((font): font is BuiltinFontDefinition => Boolean(font))
        .flatMap((font) => font.faces.map((face) => face.css))
        .join('\n');
}

/** Removes Google requests shadowed by an explicitly selected local family. */
export function getGoogleFontRequests(fonts: GoogleFontRequest[] | undefined): GoogleFontRequest[] {
    const selected = fonts ?? [];
    const builtinFamilies = new Set(
        selected
            .filter((font): font is ResumeFont => typeof font !== 'string' && font.provider === 'builtin')
            .map((font) => font.family.toLocaleLowerCase())
    );
    return selected.filter((font) =>
        typeof font === 'string'
            || (font.provider === 'google' && !builtinFamilies.has(font.family.toLocaleLowerCase()))
    );
}

export function getBuiltinFamilies(): string[] {
    return BUILTIN_FONT_CATALOG.map((font) => font.family);
}
