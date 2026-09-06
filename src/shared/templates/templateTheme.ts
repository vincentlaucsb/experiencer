import CssNode from '@/shared/CssTree';
import { deepCopy } from '@/shared/utils/deepCopy';
import type { ResumeSaveData } from '@/types';

export interface TemplateCss {
    rootCss: CssNode;
    builtinCss: CssNode;
}

export type TemplateThemeTransform = (defaultCss: TemplateCss) => TemplateCss;

/** Catalog-only presentation metadata; documents persist just the transformed CSS. */
export interface TemplateTheme {
    id: string;
    name: string;
    fill: string;
    transform: TemplateThemeTransform;
}

/** Always starts from an isolated copy of the default, never a previous theme result. */
export function applyTemplateTheme(defaultDocument: ResumeSaveData, theme: TemplateTheme): ResumeSaveData {
    const document = deepCopy(defaultDocument);
    const css = theme.transform({
        rootCss: CssNode.load(document.rootCss),
        builtinCss: CssNode.load(document.builtinCss)
    });
    return { ...document, rootCss: css.rootCss.dump(), builtinCss: css.builtinCss.dump() };
}

/** A convenience transform for palettes; themes may also restructure either CSS tree. */
export function rootPalette(properties: Record<string, string>): TemplateThemeTransform {
    return css => {
        css.rootCss.setProperties(current => new Map([...current, ...Object.entries(properties)]));
        return css;
    };
}
