import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { createContainer } from "@/shared/utils/Helpers";

interface Position {
    x: number;
    y: number;
}

interface MenuController {
    show: (position: Position) => void;
    hide: () => void;
}

// Singleton: only one context menu can be open at a time
let currentMenu: MenuController | null = null;

/**
 * ContextMenu - A custom context menu that appears at right-click coordinates
 * 
 * Usage:
 * <ContextMenu id="my-menu">
 *   <h3>Menu Title</h3>
 *   <MenuItem onClick={handler}>Option 1</MenuItem>
 *   <MenuItem onClick={handler}>Option 2</MenuItem>
 * </ContextMenu>
 */
export function ContextMenu({ id, children }: { id: string; children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    const show = (pos: Position) => {
        // Close any currently open menu before opening this one
        if (currentMenu && currentMenu !== controller) {
            currentMenu.hide();
        }
        setPosition(pos);
        setIsVisible(true);
        currentMenu = controller;
    };

    const hide = () => {
        setIsVisible(false);
        if (currentMenu === controller) {
            currentMenu = null;
        }
    };

    const controller: MenuController = { show, hide };

    // Register this menu as the target for its ID
    useEffect(() => {
        const registry = (window as any).__contextMenuRegistry || {};
        registry[id] = controller;
        (window as any).__contextMenuRegistry = registry;

        return () => {
            delete registry[id];
        };
    }, [id]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isVisible) {
                hide();
            }
        };

        if (isVisible) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [isVisible]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                hide();
            }
        };

        if (isVisible) {
            // Delay to avoid closing immediately on the right-click that opened it
            setTimeout(() => {
                document.addEventListener("click", handleClickOutside);
            }, 0);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [isVisible]);

    // Auto-focus menu when it opens (for keyboard navigation)
    useEffect(() => {
        if (isVisible && menuRef.current) {
            menuRef.current.focus();
        }
    }, [isVisible]);

    if (!isVisible) {
        return null;
    }

    const contextMenuContainer = createContainer("context-menu-container");

    return createPortal(
        <div
            ref={menuRef}
            className="react-contextmenu"
            style={{
                position: "fixed",
                top: position.y,
                left: position.x,
                zIndex: 9999,
            }}
            tabIndex={-1}
            onClick={(e) => {
                // Stop clicks inside menu from closing it
                e.stopPropagation();
            }}
        >
            {children}
        </div>,
        contextMenuContainer
    );
}

/**
 * MenuItem - A clickable item in the context menu
 */
export function MenuItem({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
    const handleClick = () => {
        // Close the current menu before executing the action
        if (currentMenu) {
            currentMenu.hide();
        }
        onClick?.();
    };

    return (
        <div className="react-contextmenu-item" onClick={handleClick}>
            {children}
        </div>
    );
}

/**
 * ContextMenuTrigger - Wraps an element and triggers the context menu on right-click
 * 
 * Usage:
 * <ContextMenuTrigger id="my-menu" renderTag="div" attributes={{ className: "..." }}>
 *   <YourContent />
 * </ContextMenuTrigger>
 */
export function ContextMenuTrigger({
    id,
    children,
    renderTag = "div",
    attributes = {},
    onContextMenu,
    disabled = false,
}: {
    id: string;
    children: ReactNode;
    renderTag?: string;
    attributes?: Record<string, any>;
    onContextMenu?: (e: ReactMouseEvent) => void;
    disabled?: boolean;
}) {
    const tagRef = useRef<HTMLElement | null>(null);

    const handleContextMenu = (e: ReactMouseEvent) => {
        if (disabled) {
            return;
        }

        onContextMenu?.(e);

        if (e.defaultPrevented) {
            return;
        }

        e.preventDefault();
        
        const registry = (window as any).__contextMenuRegistry || {};
        const menu = registry[id] as MenuController | undefined;
        
        if (menu) {
            menu.show({ x: e.clientX, y: e.clientY });
        }
    };

    const Tag = renderTag as any;
    const { onClick: onClickAttr, ref: attributesRef, ...passthroughAttributes } = attributes;

    const setTagRef = (node: HTMLElement | null) => {
        tagRef.current = node;

        if (typeof attributesRef === 'function') {
            attributesRef(node);
        }
        else if (attributesRef && typeof attributesRef === 'object') {
            attributesRef.current = node;
        }
    };

    useEffect(() => {
        const element = tagRef.current;
        if (!element) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            if (onClickAttr) {
                onClickAttr(event as unknown as ReactMouseEvent);
            }
        };

        const handleNativeContextMenu = (event: MouseEvent) => {
            handleContextMenu(event as unknown as ReactMouseEvent);
        };

        element.addEventListener('click', handleClick);
        element.addEventListener('contextmenu', handleNativeContextMenu);

        return () => {
            element.removeEventListener('click', handleClick);
            element.removeEventListener('contextmenu', handleNativeContextMenu);
        };
    }, [disabled, id, onClickAttr, onContextMenu]);

    return (
        <Tag {...passthroughAttributes} ref={setTagRef}>
            {children}
        </Tag>
    );
}
