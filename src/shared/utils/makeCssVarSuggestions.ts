import CssNode from "@/shared/CssTree";

/**
 * Given the root CSS node, generate suggestions for CSS variable usage
 * in the form of "var(--variable-name)".
 * @param rootCss The root CSS node to extract variable names from.
 * @returns An array of CSS variable usage strings.
 */
export default function makeCssVarSuggestions(rootCss: CssNode): string[] {
    let suggestions = new Array<string>();

    for (let k of rootCss.properties.keys()) {
        if (k.slice(0, 2) === '--') {
            suggestions.push(`var(${k})`);
        }
    }
    
    return suggestions;
}