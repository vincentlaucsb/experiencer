import ComponentTypes from "@/resume/schema/ComponentTypes";
import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import type { ResumeNode } from "@/types";

/** Resolves CSS rules that apply through a resume node's structural ancestors. */
export default function findApplicableCssAncestors(
    ancestorNodes: ReadonlyArray<ResumeNode>,
    css: CssNode
): ReadonlyArray<ReadonlyCssNode> {
    const rules: CssNode[] = [];
    const seenPaths = new Set<string>();

    const addRule = (rule: CssNode | undefined) => {
        if (!rule) {
            return;
        }

        const pathKey = rule.fullPath.join("\u0000");
        if (!seenPaths.has(pathKey)) {
            seenPaths.add(pathKey);
            rules.push(rule);
        }
    };

    for (const ancestor of ancestorNodes) {
        if (ancestor.htmlId) {
            addRule(css.findNodeBySelector(`#${ancestor.htmlId}`));
        }

        addRule(css.findNode(ComponentTypes.instance.cssName(ancestor.type)));
    }

    return rules.map((rule) => new ReadonlyCssNode(rule));
}
