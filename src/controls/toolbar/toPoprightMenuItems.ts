import type { MouseEvent as ReactMouseEvent } from "react";
import type { MenuChildItem, MenuItem, MenuSelectEvent } from "popright";
import type { ToolbarItemData } from "./ToolbarButton";
import { createPoprightIcon, getPoprightItemId } from "../menus/poprightMenu";

/** Converts the framework-neutral toolbar model into Popright menu data. */
export function toPoprightMenuItems(items: ToolbarItemData[], prefix = "toolbar"): MenuItem[] {
    return items.flatMap((item, index): MenuItem[] => {
        if (item.separator || item.content) {
            return [{ type: "separator" } satisfies MenuItem];
        }

        if (!item.text && !item.items) {
            return [];
        }

        const label = item.text || "More";
        const id = getPoprightItemId(label, index, prefix);
        const icon = createPoprightIcon(item.icon, item.iconTone);

        if (item.items) {
            return [{
                type: "submenu",
                id,
                label,
                icon,
                items: toPoprightChildItems(item.items, id)
            } satisfies MenuItem];
        }

        return [{
            id,
            label,
            icon,
            shortcut: item.shortcut,
            disabled: !item.onClick,
            onSelect: item.onClick
                ? (event: MenuSelectEvent) => {
                    const action = item.onClick as (event: ReactMouseEvent) => void;
                    action(event.context.triggerEvent as unknown as ReactMouseEvent);
                }
                : undefined
        } satisfies MenuItem];
    });
}

/** Popright currently permits only one submenu level; flatten deeper toolbar groups. */
function toPoprightChildItems(items: ToolbarItemData[], prefix: string): MenuChildItem[] {
    return items.flatMap((item, index): MenuChildItem[] => {
        if (item.separator || item.content) {
            return [{ type: "separator" }];
        }

        if (!item.text && !item.items) {
            return [];
        }

        const label = item.text || "More";
        if (item.items) {
            return toPoprightChildItems(item.items, `${prefix}-${index}`).map((child) => {
                if (child.type === "separator") {
                    return child;
                }

                return {
                    ...child,
                    label: `${label} › ${child.label}`
                };
            });
        }

        const id = getPoprightItemId(label, index, prefix);
        return [{
            id,
            label,
            icon: createPoprightIcon(item.icon, item.iconTone),
            shortcut: item.shortcut,
            disabled: !item.onClick,
            onSelect: item.onClick
                ? (event: MenuSelectEvent) => {
                    const action = item.onClick as (event: ReactMouseEvent) => void;
                    action(event.context.triggerEvent as unknown as ReactMouseEvent);
                }
                : undefined
        }];
    });
}
