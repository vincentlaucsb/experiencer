import {
    generate,
    lexer,
    List,
    parse,
    tokenize,
    tokenTypes,
    walk,
    type CssNode,
    type Rule,
    type Selector,
    type SelectorList
} from 'css-tree';
import { isCssIdentifier } from './validateNodeCssNames';

export const EDITOR_RESUME_SELECTOR = '#resume';

function hasUnescapedEnd(token: string, ending: string): boolean {
    if (token.length < 2 || !token.endsWith(ending)) return false;
    let escapes = 0;
    for (let index = token.length - 2; token[index] === '\\'; index -= 1) escapes += 1;
    return escapes % 2 === 0;
}

function assertClosedCssBlocks(stylesheet: string): void {
    const delimiters: number[] = [];
    const unterminated = () => { throw new Error('Résumé CSS contains an unterminated block, string, or comment.'); };
    // Strings and unquoted URLs are atomic CSS tokens: their literal brackets
    // must never be interpreted as declaration or stylesheet structure.
    tokenize(stylesheet, (type, start, end) => {
        switch (type) {
            case tokenTypes.Function:
            case tokenTypes.LeftParenthesis:
                delimiters.push(tokenTypes.RightParenthesis);
                break;
            case tokenTypes.LeftSquareBracket:
                delimiters.push(tokenTypes.RightSquareBracket);
                break;
            case tokenTypes.LeftCurlyBracket:
                delimiters.push(tokenTypes.RightCurlyBracket);
                break;
            case tokenTypes.RightParenthesis:
            case tokenTypes.RightSquareBracket:
            case tokenTypes.RightCurlyBracket:
                if (delimiters.pop() !== type) {
                    throw new Error(type === tokenTypes.RightCurlyBracket
                        ? 'Résumé CSS contains an unmatched closing brace.'
                        : 'Résumé CSS contains an unmatched closing delimiter.');
                }
                break;
            case tokenTypes.String:
                if (!hasUnescapedEnd(stylesheet.slice(start, end), stylesheet[start])) unterminated();
                break;
            case tokenTypes.Url:
                if (!hasUnescapedEnd(stylesheet.slice(start, end), ')')) unterminated();
                break;
            case tokenTypes.Comment:
                // The closing marker must not overlap the opening marker (/*/).
                if (end - start < 4 || !stylesheet.slice(start, end).endsWith('*/')) unterminated();
                break;
            case tokenTypes.BadString:
            case tokenTypes.BadUrl:
                unterminated();
                break;
        }
    });
    if (delimiters.length > 0) unterminated();
}

function parseStrict(stylesheet: string, context?: string): CssNode {
    if (!context) assertClosedCssBlocks(stylesheet);
    return parse(stylesheet, {
        context,
        positions: true,
        parseRulePrelude: true,
        onParseError: (error) => {
            throw error;
        }
    });
}

/** Validate one authored declaration before it can change the CSS tree. */
export function getCssDeclarationError(property: string, value: string): string | undefined {
    if (!isCssIdentifier(property)) {
        return 'Use a CSS property name, such as font-size or --accent-color.';
    }
    // Empty values are intentional drafts created by the property-name field.
    if (!value.trim()) return;
    try {
        assertClosedCssBlocks(value);
        const declaration = parseStrict(`${property}: ${value}`, 'declaration');
        if (declaration.type !== 'Declaration' || declaration.property !== property) {
            return 'Enter one CSS value without adding declarations or rules.';
        }
        // Validate the serializer's actual delimiter boundary too: an EOF escape
        // can otherwise consume the appended semicolon and the next declaration.
        const wrapped = parseStrict(`.validation { ${property}: ${value};\n--validation-end: initial; }`);
        if (wrapped.type !== 'StyleSheet' || wrapped.children.size !== 1) throw new Error('Invalid declaration boundary.');
        const rule = wrapped.children.first;
        if (rule?.type !== 'Rule' || rule.block.children.size !== 2) throw new Error('Invalid declaration boundary.');
        const last = rule.block.children.last;
        if (last?.type !== 'Declaration' || last.property !== '--validation-end') throw new Error('Invalid declaration boundary.');
        const parsedValue = generate(declaration.value);
        if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
            if (!CSS.supports(property, parsedValue)) return `Enter a supported value for ${property}.`;
        } else if (!property.startsWith('--')) {
            const match = lexer.matchProperty(property.toLowerCase(), declaration.value);
            // Substitution is deferred until variables resolve in the document.
            if (match.error && !match.error.message.startsWith('Matching for a tree with var()')) {
                return `Enter a supported value for ${property}.`;
            }
        }
    } catch {
        return 'Enter one CSS value without adding declarations or rules.';
    }
}

function isKeyframeRule(rule: Rule, enclosingAtRuleName: string | undefined): boolean {
    return rule.prelude.type !== 'SelectorList'
        || /(?:^|-)keyframes$/i.test(enclosingAtRuleName ?? '');
}

function isDocumentRoot(node: CssNode | undefined): boolean {
    return node?.type === 'PseudoClassSelector' && node.name.toLowerCase() === 'root'
        || node?.type === 'TypeSelector' && /^(?:html|body)$/i.test(node.name);
}

function assertNoReservedEditorHost(selector: Selector): void {
    walk(selector, {
        visit: 'IdSelector',
        enter(node) {
            if (node.name === 'resume') {
                throw new Error(`${EDITOR_RESUME_SELECTOR} is reserved for Experiencer's editor host.`);
            }
        }
    });
}

function removeReservedEditorHostFromSelector(selector: Selector): boolean {
    const nodes = selector.children.toArray();
    let removed = false;
    for (let index = nodes.length - 1; index >= 0; index -= 1) {
        const node = nodes[index];
        if (node.type !== 'IdSelector' || node.name !== 'resume') continue;

        removed = true;
        nodes.splice(index, 1);
        if (nodes[index]?.type === 'Combinator') {
            nodes.splice(index, 1);
        } else if (nodes[index - 1]?.type === 'Combinator') {
            nodes.splice(index - 1, 1);
        }
    }

    if (!removed) return false;
    if (nodes.length === 0) {
        nodes.push({ type: 'PseudoClassSelector', name: 'root', children: null });
    }
    selector.children = new List<CssNode>().fromArray(nodes);
    return true;
}

/** Validate one selector entered through the CSS editor. */
export function validateAuthoredCssSelector(selector: string): string {
    const selectors = parseStrict(selector, 'selectorList');
    if (selectors.type !== 'SelectorList') {
        throw new Error('Expected a CSS selector.');
    }
    selectors.children.forEach((node) => {
        if (node.type === 'Selector') assertNoReservedEditorHost(node);
    });
    return selector;
}

/** Remove the private editor host from a selector loaded from saved data. */
export function removeReservedEditorHost(selector: string): string {
    const selectors = parseStrict(selector, 'selectorList');
    if (selectors.type !== 'SelectorList') {
        throw new Error('Expected a CSS selector.');
    }
    let removed = false;
    walk(selectors, {
        visit: 'Selector',
        leave(node) {
            removed = removeReservedEditorHostFromSelector(node) || removed;
        }
    });
    return removed ? generate(selectors) : selector;
}

function scopeSelector(selector: Selector): void {
    assertNoReservedEditorHost(selector);
    const nodes = selector.children.toArray();
    const first = nodes[0];
    const editorRoot: CssNode = { type: 'IdSelector', name: 'resume' };

    if (isDocumentRoot(first)) {
        nodes[0] = editorRoot;
        if (first?.type === 'TypeSelector' && first.name.toLowerCase() === 'html') {
            const bodyIndex = nodes[1]?.type === 'Combinator' ? 2 : 1;
            if (nodes[bodyIndex]?.type === 'TypeSelector'
                && nodes[bodyIndex].name.toLowerCase() === 'body') {
                nodes.splice(1, bodyIndex);
            }
        }
    } else {
        nodes.unshift(editorRoot, { type: 'Combinator', name: ' ' });
    }

    selector.children = new List<CssNode>().fromArray(nodes);
}

function scopeSelectorList(selectors: SelectorList): string {
    selectors.children.forEach((node) => {
        if (node.type !== 'Selector') {
            throw new Error('Expected a selector list while preparing résumé CSS.');
        }
        scopeSelector(node);
    });
    return generate(selectors);
}

/** Scope one authored selector to the private editor host. */
export function scopeCssSelectorForEditor(selector: string): string {
    const selectors = parseStrict(selector, 'selectorList');
    if (selectors.type !== 'SelectorList') {
        throw new Error('Expected a selector list while preparing résumé CSS.');
    }
    return scopeSelectorList(selectors);
}

interface SelectorReplacement {
    start: number;
    end: number;
    value: string;
}

function collectSelectorReplacements(stylesheet: string): SelectorReplacement[] {
    const root = parseStrict(stylesheet);
    const replacements: SelectorReplacement[] = [];
    walk(root, {
        visit: 'Rule',
        enter(rule) {
            if (isKeyframeRule(rule, this.atrule?.name)) return;
            const location = rule.prelude.loc;
            if (!location || rule.prelude.type !== 'SelectorList') {
                throw new Error('Unable to locate a résumé CSS selector.');
            }
            replacements.push({
                start: location.start.offset,
                end: location.end.offset,
                value: scopeSelectorList(rule.prelude)
            });
        }
    });
    return replacements;
}

/** Parse authored CSS and scope every ordinary rule to the editor-only resume host. */
export function scopeResumeStylesheetToEditor(stylesheet: string): string {
    const replacements = collectSelectorReplacements(stylesheet)
        .sort((left, right) => right.start - left.start);
    return replacements.reduce(
        (result, replacement) => result.slice(0, replacement.start)
            + replacement.value
            + result.slice(replacement.end),
        stylesheet
    );
}

/** Validate that authored CSS does not reference Experiencer's private editor host. */
export function validateAuthoredResumeStylesheet(stylesheet: string): string {
    const root = parseStrict(stylesheet);
    walk(root, {
        visit: 'Rule',
        enter(rule) {
            if (isKeyframeRule(rule, this.atrule?.name)) return;
            if (rule.prelude.type !== 'SelectorList') {
                throw new Error('Unable to parse a résumé CSS selector.');
            }
            rule.prelude.children.forEach((node) => {
                if (node.type === 'Selector') assertNoReservedEditorHost(node);
            });
        }
    });
    return stylesheet;
}
