import {
    generate,
    List,
    parse,
    walk,
    type CssNode,
    type Rule,
    type Selector,
    type SelectorList
} from 'css-tree';

export const EDITOR_RESUME_SELECTOR = '#resume';

function assertClosedCssBlocks(stylesheet: string): void {
    let depth = 0;
    let quote = '';
    let inComment = false;
    for (let index = 0; index < stylesheet.length; index += 1) {
        const character = stylesheet[index];
        const next = stylesheet[index + 1];
        if (inComment) {
            if (character === '*' && next === '/') {
                inComment = false;
                index += 1;
            }
            continue;
        }
        if (quote) {
            if (character === '\\') index += 1;
            else if (character === quote) quote = '';
            continue;
        }
        if (character === '/' && next === '*') {
            inComment = true;
            index += 1;
        } else if (character === '"' || character === "'") {
            quote = character;
        } else if (character === '\\') {
            index += 1;
        } else if (character === '{') {
            depth += 1;
        } else if (character === '}') {
            depth -= 1;
            if (depth < 0) throw new Error('Résumé CSS contains an unmatched closing brace.');
        }
    }
    if (depth !== 0 || quote || inComment) {
        throw new Error('Résumé CSS contains an unterminated block, string, or comment.');
    }
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
