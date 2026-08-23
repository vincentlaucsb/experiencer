import React from "react";
import type { MenuItem } from "popright";

const passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

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

interface MockMenuProps {
    children: React.ReactElement;
    items?: MenuItem[];
    onOpen?: () => void;
    onClose?: () => void;
    trigger?: "contextmenu" | "click" | "manual";
}

/** Lightweight context-menu behavior for Jest; production behavior lives in Popright. */
export function ContextMenu({
    children,
    items = [],
    onOpen,
    onClose,
    trigger = "contextmenu"
}: MockMenuProps) {
    const [open, setOpen] = React.useState(false);
    const child = trigger === "contextmenu"
        ? React.cloneElement(children, {
            onContextMenu: (event: React.MouseEvent) => {
                children.props.onContextMenu?.(event);
                event.preventDefault();
                onOpen?.();
                setOpen(true);
            }
        })
        : children;

    return (
        <>
            {child}
            {open ? <MockMenu items={items} close={() => {
                setOpen(false);
                onClose?.();
            }} /> : null}
        </>
    );
}

/** Lightweight dropdown behavior for Jest; production behavior lives in Popright. */
export function DropdownMenu({
    children,
    items = [],
    onOpen,
    onClose
}: MockMenuProps) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        if (!open) {
            return;
        }

        const closeOnOutsideMouseDown = (event: MouseEvent) => {
            const target = event.target as Element | null;
            if (!target?.closest("[data-popright-menu]")) {
                setOpen(false);
                onClose?.();
            }
        };

        document.addEventListener("mousedown", closeOnOutsideMouseDown);
        return () => document.removeEventListener("mousedown", closeOnOutsideMouseDown);
    }, [onClose, open]);

    const trigger = React.cloneElement(children, {
        onClick: (event: React.MouseEvent) => {
            children.props.onClick?.(event);
            if (open) {
                setOpen(false);
                onClose?.();
            } else {
                setOpen(true);
                onOpen?.();
            }
        }
    });

    return (
        <>
            {trigger}
            {open ? <MockMenu items={items} close={() => {
                setOpen(false);
                onClose?.();
            }} /> : null}
        </>
    );
}

function MockMenu({ items, close }: { items: MenuItem[]; close(): void }) {
    return (
        <div data-popright-menu role="menu">
            {items.map((item, index) => item.type === "separator"
                ? <div key={`separator-${index}`} role="separator" />
                : <div
                    key={("id" in item && item.id) || `${item.type ?? "item"}-${index}`}
                    data-popright-item
                    role="menuitem"
                    aria-disabled={"disabled" in item && item.disabled ? "true" : undefined}
                    onClick={() => {
                        if ("disabled" in item && item.disabled) return;
                        if ("onSelect" in item) {
                            item.onSelect?.({
                                id: item.id,
                                item,
                                context: { triggerEvent: new MouseEvent("click") }
                            } as never);
                        }
                        close();
                    }}
                >
                    <span>{"label" in item ? item.label : ""}</span>
                    {"shortcut" in item && item.shortcut ? (
                        <span data-popright-shortcut>{item.shortcut}</span>
                    ) : null}
                </div>)}
        </div>
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
