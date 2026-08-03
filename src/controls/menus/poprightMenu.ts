import type { MenuIcon, MenuItem } from "popright";

export type { MenuItem };

/** Creates an IcoFont icon node for Popright's DOM-owned menu renderer. */
export function createPoprightIcon(icon?: string, iconTone?: "brand"): MenuIcon | undefined {
    if (!icon) {
        return undefined;
    }

    return () => {
        const element = document.createElement("i");
        element.className = [
            `icofont-${icon}`,
            iconTone ? `toolbar-icon-${iconTone}` : undefined
        ].filter(Boolean).join(" ");
        element.setAttribute("aria-hidden", "true");
        return element;
    };
}

/** Keeps Popright menu IDs stable while allowing repeated toolbar labels. */
export function getPoprightItemId(label: string, index: number, prefix = "item"): string {
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `${prefix}-${slug || "item"}-${index}`;
}

