const EDITOR_RESUME_SELECTOR = "#resume";

function skipCommentOrString(stylesheet: string, index: number) {
    if (stylesheet.startsWith("/*", index)) {
        const end = stylesheet.indexOf("*/", index + 2);
        return end === -1 ? stylesheet.length : end + 2;
    }

    const quote = stylesheet[index];
    if (quote !== '"' && quote !== "'") {
        return index;
    }

    let cursor = index + 1;
    while (cursor < stylesheet.length) {
        if (stylesheet[cursor] === "\\") {
            cursor += 2;
            continue;
        }
        if (stylesheet[cursor] === quote) {
            return cursor + 1;
        }
        cursor += 1;
    }

    return stylesheet.length;
}

function findMatchingBrace(stylesheet: string, openingBrace: number) {
    let depth = 1;
    let cursor = openingBrace + 1;

    while (cursor < stylesheet.length) {
        const next = skipCommentOrString(stylesheet, cursor);
        if (next !== cursor) {
            cursor = next;
            continue;
        }

        if (stylesheet[cursor] === "{") depth += 1;
        if (stylesheet[cursor] === "}") {
            depth -= 1;
            if (depth === 0) return cursor;
        }
        cursor += 1;
    }

    return stylesheet.length - 1;
}

function splitSelectors(selectorList: string) {
    const selectors: string[] = [];
    let start = 0;
    let parentheses = 0;
    let brackets = 0;
    let cursor = 0;

    while (cursor < selectorList.length) {
        const next = skipCommentOrString(selectorList, cursor);
        if (next !== cursor) {
            cursor = next;
            continue;
        }

        switch (selectorList[cursor]) {
            case "(": parentheses += 1; break;
            case ")": parentheses = Math.max(0, parentheses - 1); break;
            case "[": brackets += 1; break;
            case "]": brackets = Math.max(0, brackets - 1); break;
            case ",":
                if (parentheses === 0 && brackets === 0) {
                    selectors.push(selectorList.slice(start, cursor));
                    start = cursor + 1;
                }
                break;
        }
        cursor += 1;
    }

    selectors.push(selectorList.slice(start));
    return selectors;
}

function hasEditorResumeScope(selector: string) {
    return /(^|[\s>+~,(])#resume(?=$|[\s>+~.#:[(])/.test(selector);
}

/** Convert one authored selector into the editor's resume-local scope. */
export function scopeCssSelectorForEditor(selector: string) {
    const trimmed = selector.trim();
    if (!trimmed || hasEditorResumeScope(trimmed)) {
        return trimmed;
    }

    if (/:root\b/.test(trimmed)) {
        return trimmed.replace(/:root\b/g, EDITOR_RESUME_SELECTOR);
    }

    if (/^body(?=$|[\s>+~.#:[(])/.test(trimmed)) {
        return trimmed.replace(/^body(?=$|[\s>+~.#:[(])/, EDITOR_RESUME_SELECTOR);
    }

    return `${EDITOR_RESUME_SELECTOR} ${trimmed}`;
}

/** Map legacy editor-container selectors to the standalone document root. */
export function scopeCssSelectorForStandaloneResume(selector: string) {
    return selector.trim().replace(
        /(^|[\s>+~,(])#resume(?=$|[\s>+~.#:[(])/g,
        "$1body"
    );
}

function leadingWhitespace(value: string) {
    const match = value.match(/^\s*/);
    return match?.[0] ?? "";
}

function trailingWhitespace(value: string) {
    const match = value.match(/\s*$/);
    return match?.[0] ?? "";
}

function isNestedAtRule(prelude: string) {
    return /^@(media|supports|container|layer|document|scope)\b/i.test(prelude.trim());
}

function transformRulePrelude(
    prelude: string,
    transformSelector: (selector: string) => string
) {
    const prefix = leadingWhitespace(prelude);
    const withoutPrefix = prelude.slice(prefix.length);
    const suffix = trailingWhitespace(withoutPrefix);
    const selector = withoutPrefix.slice(0, withoutPrefix.length - suffix.length);
    return `${prefix}${splitSelectors(selector)
        .map(transformSelector)
        .join(", ")}${suffix}`;
}

function transformRules(
    stylesheet: string,
    transformSelector: (selector: string) => string
): string {
    let result = "";
    let segmentStart = 0;
    let cursor = 0;

    while (cursor < stylesheet.length) {
        const next = skipCommentOrString(stylesheet, cursor);
        if (next !== cursor) {
            cursor = next;
            continue;
        }

        const character = stylesheet[cursor];
        if (character === ";") {
            result += stylesheet.slice(segmentStart, cursor + 1);
            segmentStart = cursor + 1;
        } else if (character === "{") {
            const closingBrace = findMatchingBrace(stylesheet, cursor);
            const prelude = stylesheet.slice(segmentStart, cursor);
            const body = stylesheet.slice(cursor + 1, closingBrace);
            const scopedPrelude = prelude.trimStart().startsWith("@")
                ? prelude
                : transformRulePrelude(prelude, transformSelector);
            const scopedBody = isNestedAtRule(prelude)
                ? transformRules(body, transformSelector)
                : body;

            result += `${scopedPrelude}{${scopedBody}}`;
            segmentStart = closingBrace + 1;
            cursor = closingBrace;
        }
        cursor += 1;
    }

    return result + stylesheet.slice(segmentStart);
}

/**
 * Scope authored CSS to the editor's resume element without changing the
 * stylesheet that is saved or emitted for print/export.
 */
export default function scopeStylesheetForEditor(stylesheet: string) {
    return transformRules(stylesheet, scopeCssSelectorForEditor);
}

/**
 * Prepare older editor-scoped stylesheets for standalone output, whose body
 * contains the resume's descendants rather than the editor-only #resume host.
 */
export function scopeStylesheetForStandaloneResume(stylesheet: string) {
    return transformRules(stylesheet, scopeCssSelectorForStandaloneResume);
}
