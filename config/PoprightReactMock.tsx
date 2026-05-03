import type * as React from "react";

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

export function useContextMenu() {
    return {
        ref: () => undefined,
        open: () => undefined,
        close: () => undefined,
        update: () => undefined
    };
}
