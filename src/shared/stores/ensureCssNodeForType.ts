import ComponentTypes from "@/resume/schema/ComponentTypes";
import { cssStore } from "@/shared/stores/cssStoreHooks";
import getDefaultCss from "@/templates/CssTemplates";

/**
 * Ensure the CSS tree contains a node for the provided component type.
 * If missing, it copies the node skeleton from the default template CSS.
 */
export default function ensureCssNodeForType(type: string) {
    const cssPath = ComponentTypes.instance.cssName(type);
    const defaultCss = getDefaultCss();

    if (cssStore.data.findNode([...cssPath])) {
        return;
    }

    const defaultCssNode = defaultCss.findNode([...cssPath]);
    if (!defaultCssNode) {
        return;
    }

    cssStore.updateCss((css) => {
        if (css.findNode([...cssPath])) {
            return;
        }

        const parentPath = cssPath.slice(0, -1);
        if (parentPath.length === 0) {
            css.addNode(defaultCssNode.deepCopy());
            return;
        }

        const parent = css.findNode([...parentPath]);
        if (parent) {
            parent.addNode(defaultCssNode.deepCopy());
            return;
        }

        const defaultParent = defaultCss.findNode([...parentPath]);
        if (defaultParent) {
            css.addNode(defaultParent.deepCopy());
        }
    });
}
