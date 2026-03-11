import ComponentTypes from "@/resume/schema/ComponentTypes";
import { cssStore } from "@/shared/stores/cssStoreHooks";
import getDefaultCss from "@/templates/CssTemplates";

/**
 * Ensure the CSS tree contains a node for the provided component type.
 * If missing, it copies the node skeleton from the default template CSS.
 */
export default function ensureCssNodeForType(type: string) {
    const cssPath = ComponentTypes.instance.cssName(type);

    if (cssStore.data.findNode([...cssPath])) {
        return;
    }

    const defaultCss = getDefaultCss();
    const defaultNode = defaultCss.findNode([...cssPath]);

    cssStore.updateCss((css) => {
        if (css.findNode([...cssPath])) {
            return;
        }

        if (defaultNode) {
            // Seed from default template; create any missing parents as empty nodes
            css.findOrCreateNode(cssPath.slice(0, -1)).addNode(defaultNode.deepCopy());
        } else {
            // No default exists — create an empty node so the CSS editor shows the entry
            css.findOrCreateNode(cssPath);
        }
    });
}
