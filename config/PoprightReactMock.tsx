import React from "react";
import type { MenuItem } from "popright";

const passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export const ContextMenu = passthrough;
export const ContextMenuTrigger = passthrough;
export const ContextMenuContent = passthrough;
export const ContextMenuItem = passthrough;
export const ContextMenuItems = passthrough;
export const ContextMenuSeparator = passthrough;
export const ContextMenuHeader = passthrough;
export const ContextMenuLabel = passthrough;
export const ContextMenuSubmenu = passthrough;
export const ContextMenuSubmenuTrigger = passthrough;
export const ContextMenuSubmenuContent = passthrough;

/** Lightweight dropdown behavior for Jest; production behavior lives in Popright. */
export function DropdownMenu({
    children,
    items = []
}: {
    children: React.ReactElement;
    items?: MenuItem[];
}) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        if (!open) {
            return;
        }

        const closeOnOutsideMouseDown = (event: MouseEvent) => {
            const target = event.target as Element | null;
            if (!target?.closest("[data-popright-menu]")) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", closeOnOutsideMouseDown);
        return () => document.removeEventListener("mousedown", closeOnOutsideMouseDown);
    }, [open]);

    const trigger = React.cloneElement(children, {
        onClick: (event: React.MouseEvent) => {
            children.props.onClick?.(event);
            setOpen((value) => !value);
        }
    });

    return (
        <>
            {trigger}
            {open ? (
                <div data-popright-menu role="menu">
                    {items.map((item, index) => item.type === "separator"
                        ? <div key={`separator-${index}`} role="separator" />
                        : <div
                            key={item.id}
                            data-popright-item
                            role="menuitem"
                            onClick={() => {
                                item.onSelect?.({
                                    id: item.id,
                                    item,
                                    context: { triggerEvent: new MouseEvent("click") }
                                } as never);
                                setOpen(false);
                            }}
                        >
                            <span>{item.label}</span>
                            {"shortcut" in item && item.shortcut ? (
                                <span data-popright-shortcut>{item.shortcut}</span>
                            ) : null}
                        </div>)}
                </div>
            ) : null}
        </>
    );
}

export function useContextMenu() {
    return {
        ref: () => undefined,
        open: () => undefined,
        close: () => undefined,
        update: () => undefined
    };
}
