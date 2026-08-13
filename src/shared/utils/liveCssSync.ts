import { ReadonlyCssNode } from "@/shared/CssTree";
import { scopeCssSelectorForEditor } from "@/shared/utils/transformResumeStylesheet";

export type LiveCssSyncStatus = "changed" | "not-found" | "unchanged";

export interface LiveCssSyncResult {
    status: LiveCssSyncStatus;
    declarations: ReadonlyMap<string, string>;
    added: ReadonlyArray<string>;
    changed: ReadonlyArray<string>;
    removed: ReadonlyArray<string>;
}

export interface LiveCssTreeChange extends LiveCssSyncResult {
    name: string;
    path: ReadonlyArray<string>;
    selector: string;
    previousDeclarations: ReadonlyMap<string, string>;
}

function normalizeSelector(selector: string) {
    return selector
        .replace(/\s*,\s*/g, ",")
        .replace(/\s*([>+~])\s*/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

function isStyleRule(rule: CSSRule): rule is CSSStyleRule {
    return "selectorText" in rule && "style" in rule;
}

function collectMatchingRules(
    rules: CSSRuleList,
    selector: string,
    matches: CSSStyleRule[]
) {
    for (const rule of Array.from(rules)) {
        if (isStyleRule(rule) && normalizeSelector(rule.selectorText) === selector) {
            matches.push(rule);
        }
    }
}

function readDeclarations(rules: CSSStyleRule[]) {
    const declarations = new Map<string, string>();

    for (const rule of rules) {
        for (const property of Array.from(rule.style)) {
            const value = rule.style.getPropertyValue(property).trim();
            const priority = rule.style.getPropertyPriority(property);
            declarations.set(property, priority ? `${value} !${priority}` : value);
        }
    }

    return declarations;
}

function normalizeDeclarations(
    declarations: ReadonlyMap<string, string>,
    ownerDocument: Document
) {
    const style = ownerDocument.createElement("span").style;

    for (const [property, authoredValue] of declarations) {
        const important = /\s*!important\s*$/i.test(authoredValue);
        const value = authoredValue.replace(/\s*!important\s*$/i, "");
        style.setProperty(property, value, important ? "important" : "");
    }

    const normalized = new Map<string, string>();
    for (const property of Array.from(style)) {
        const value = style.getPropertyValue(property).trim();
        const priority = style.getPropertyPriority(property);
        normalized.set(property, priority ? `${value} !${priority}` : value);
    }

    return normalized;
}

/**
 * Compare a CSS-tree node with the matching live rule in the editor-owned
 * stylesheet. DevTools changes CSSOM in place, so this captures authored rule
 * edits without importing computed or inherited styles.
 */
export function inspectLiveCssRule(
    selector: string,
    currentDeclarations: ReadonlyMap<string, string>,
    ownerDocument: Document = document
): LiveCssSyncResult {
    const matches: CSSStyleRule[] = [];
    const normalizedSelector = normalizeSelector(selector);
    const styleElements = ownerDocument.querySelectorAll<HTMLStyleElement>(
        "style[data-resume-editor-stylesheet]"
    );

    for (const styleElement of Array.from(styleElements)) {
        const rules = styleElement.sheet?.cssRules;
        if (rules) {
            collectMatchingRules(rules, normalizedSelector, matches);
        }
    }

    if (matches.length === 0) {
        return {
            status: "not-found",
            declarations: new Map(currentDeclarations),
            added: [],
            changed: [],
            removed: []
        };
    }

    const declarations = readDeclarations(matches);
    const normalizedCurrentDeclarations = normalizeDeclarations(
        currentDeclarations,
        ownerDocument
    );
    const added = Array.from(declarations.keys()).filter(
        (property) => !normalizedCurrentDeclarations.has(property)
    );
    const changed = Array.from(declarations.entries())
        .filter(([property, value]) => (
            normalizedCurrentDeclarations.has(property)
            && normalizedCurrentDeclarations.get(property) !== value
        ))
        .map(([property]) => property);
    const removed = Array.from(normalizedCurrentDeclarations.keys()).filter(
        (property) => !declarations.has(property)
    );

    return {
        status: added.length || changed.length || removed.length
            ? "changed"
            : "unchanged",
        declarations,
        added,
        changed,
        removed
    };
}

export function inspectLiveCssTree(
    root: ReadonlyCssNode,
    ownerDocument: Document = document
): ReadonlyArray<LiveCssTreeChange> {
    if (!ownerDocument.querySelector("style[data-resume-editor-stylesheet]")) {
        return [];
    }

    const changes: LiveCssTreeChange[] = [];

    function inspectNode(node: ReadonlyCssNode) {
        const previousDeclarations = node.properties;
        let result = inspectLiveCssRule(
            scopeCssSelectorForEditor(node.fullSelector),
            previousDeclarations,
            ownerDocument
        );

        if (result.status === "not-found" && previousDeclarations.size > 0) {
            result = {
                status: "changed",
                declarations: new Map(),
                added: [],
                changed: [],
                removed: Array.from(previousDeclarations.keys())
            };
        }

        if (result.status === "changed") {
            changes.push({
                ...result,
                name: node.name,
                path: node.fullPath,
                selector: node.fullSelector,
                previousDeclarations
            });
        }

        for (const child of node.children) {
            inspectNode(child);
        }
    }

    inspectNode(root);
    return changes;
}

export function countLiveCssDeclarationChanges(
    changes: ReadonlyArray<LiveCssTreeChange>
) {
    return changes.reduce(
        (total, change) => (
            total
            + change.added.length
            + change.changed.length
            + change.removed.length
        ),
        0
    );
}
