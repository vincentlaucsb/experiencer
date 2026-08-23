import * as React from "react";
import type { MenuItem } from "popright";

import { Button } from "@/controls/Buttons";
import Dropdown from "@/controls/menus/Dropdown";
import { createPoprightIcon } from "@/controls/menus/poprightMenu";
import KeyboardShortcutsModal from "@/help/KeyboardShortcutsModal";
import { hintStore } from "@/shared/stores/hintStore";
import { showToast } from "@/shared/stores/toastStore";

interface HelpMenuProps {
    extensionItems?: MenuItem[];
}

/** Owns Help-menu commands and keyboard-shortcut dialog focus restoration. */
export default function HelpMenu(props: HelpMenuProps) {
    const [isShortcutsOpen, setShortcutsOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const items: MenuItem[] = [
        {
            id: "documentation",
            label: "Documentation (opens in a new tab)",
            icon: createPoprightIcon("book-alt"),
            onSelect: () => {
                const documentationWindow = window.open(
                    "/docs/",
                    "_blank",
                    "noopener,noreferrer"
                );
                if (documentationWindow) documentationWindow.opener = null;
            }
        },
        {
            id: "keyboard-shortcuts",
            label: "Keyboard shortcuts",
            icon: createPoprightIcon("keyboard"),
            onSelect: () => setShortcutsOpen(true)
        },
        {
            id: "reset-tips",
            label: "Reset tips",
            icon: createPoprightIcon("refresh"),
            onSelect: () => {
                hintStore.reset();
                showToast("Tips reset. Contextual help will appear again.");
            }
        },
        ...(props.extensionItems?.length
            ? [{ type: "separator" } as MenuItem, ...props.extensionItems]
            : [])
    ];
    const closeShortcuts = () => {
        setShortcutsOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
    };

    return (
        <>
            <KeyboardShortcutsModal
                isOpen={isShortcutsOpen}
                close={closeShortcuts}
            />
            <Dropdown
                className="toolbar-dropdown"
                items={items}
                trigger={(
                    <Button ref={triggerRef} aria-label="Help">
                        <i className="icofont-question-circle" aria-hidden="true" />
                        <span className="top-nav-trigger-label">Help</span>
                    </Button>
                )}
            />
        </>
    );
}
