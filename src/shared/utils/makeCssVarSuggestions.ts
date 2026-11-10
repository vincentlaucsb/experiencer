import { generate, parse } from "css-tree";
import type CssNode from "@/shared/CssTree";
import type { ReadonlyCssNode } from "@/shared/CssTree";
import { scopeCssSelectorForEditor } from "./transformResumeStylesheet";

const transientPseudoClasses = new Set(["active", "hover", "focus", "focus-visible", "focus-within"]);
const legacyPseudoElements = new Set(["after", "before", "first-letter", "first-line"]);

function variableNames(rule: Pick<ReadonlyCssNode, "properties">) {
    return Array.from(rule.properties.keys()).filter(name => name.startsWith("--"));
}

function collectVariableNames(rule: CssNode, names: Set<string>) {
    variableNames(rule).forEach(name => names.add(name));
    rule.children.forEach(child => collectVariableNames(child, names));
}

function matchingStyles(rule: ReadonlyCssNode, document: Document): CSSStyleDeclaration[] {
    const window = document.defaultView;
    if (!window) return [];
    try {
        const scoped = scopeCssSelectorForEditor(rule.fullSelector);
        const selectors = parse(scoped, { context: "selectorList" });
        if (selectors.type !== "SelectorList") return [];

        return selectors.children.toArray().flatMap(selector => {
            if (selector.type !== "Selector") return [];
            const nodes = selector.children.toArray();
            const pseudoIndex = nodes.findIndex(node => node.type === "PseudoElementSelector" ||
                (node.type === "PseudoClassSelector" && legacyPseudoElements.has(node.name)));
            const origin = pseudoIndex < 0 ? nodes : nodes.slice(0, pseudoIndex);
            const pseudo = nodes[pseudoIndex];
            const pseudoElement = pseudo ? generate(pseudo) : undefined;
            const query = (relax: boolean) => document.querySelectorAll(origin.map(node =>
                relax && node.type === "PseudoClassSelector" && transientPseudoClasses.has(node.name)
                    ? ":is(*)" : generate(node)
            ).join(""));

            const matches = query(false);
            // Inactive interaction states still have the originating elements' inherited variables.
            const elements = matches.length ? matches : query(true);
            return Array.from(elements, element => window.getComputedStyle(element, pseudoElement));
        });
    } catch {
        // A stored selector may be invalid or unsupported by this browser.
        return [];
    }
}

/** Suggest authored variables defined on this rule or available across its rendered matches. */
export default function makeCssVarSuggestions(
    rule: ReadonlyCssNode,
    rootCss: CssNode,
    resumeCss: CssNode,
    document: Document
): string[] {
    const variables = new Set(variableNames(rule));
    // A nested rule inherits its authored ancestor scope even when a state
    // selector is currently inactive. Sibling combinators break that inheritance.
    let nested = rule;
    for (const ancestor of rule.ancestors) {
        if (nested.selector.split(",").some(selector => /^[+~]/.test(selector.trimStart()))) break;
        variableNames(ancestor).forEach(name => variables.add(name));
        nested = ancestor;
    }
    const styles = matchingStyles(rule, document);

    if (styles.length) {
        const candidates = new Set<string>();
        collectVariableNames(rootCss, candidates);
        collectVariableNames(resumeCss, candidates);
        // One insertion applies to the whole rule, so avoid names that resolve on only some matches.
        for (const name of candidates) {
            if (styles.every(style => style.getPropertyValue(name) !== "")) variables.add(name);
        }
    } else {
        // Rules with no current targets can still refer to document-wide authored variables.
        variableNames(rootCss).forEach(name => variables.add(name));
    }

    return Array.from(variables).sort().map(name => "var(" + name + ")");
}
