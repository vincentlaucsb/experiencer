import type { ResumeFont, ResumeSaveData } from '@/types';
import { extractFontFamiliesFromCss } from '@/shared/utils/fonts';
import { getBuiltinFont, isBuiltinFontFamily } from './builtinFonts';
import CssNode from '@/shared/CssTree';

/** Seeds a template with only the curated local families its CSS actually uses. */
export function withTemplateFonts(data: ResumeSaveData): ResumeSaveData {
    if (data.fonts) return data;
    const stylesheet = `${CssNode.load(data.rootCss).stylesheet()}\n\n${CssNode.load(data.builtinCss).stylesheet()}`;
    const families = extractFontFamiliesFromCss(stylesheet)
        .filter(isBuiltinFontFamily)
        .map((family): ResumeFont => ({
            provider: 'builtin',
            family,
            category: getBuiltinFont(family)?.category
        }));
    return { ...data, fonts: families };
}
