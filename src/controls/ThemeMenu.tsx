import React from "react";

import { Button } from "./Buttons";
import Dropdown from "./menus/Dropdown";
import { createPoprightIcon } from "./menus/poprightMenu";
import type { MenuItem } from "popright";
import {
    ThemePreference,
    themeStore
} from "@/shared/stores/themeStore";
import { useThemeSnapshot } from "@/shared/stores/themeStoreHooks";

const options: Array<{
    preference: ThemePreference;
    label: string;
    icon: string;
}> = [
    { preference: "system", label: "System", icon: "computer" },
    { preference: "light", label: "Light", icon: "sunny" },
    { preference: "dark", label: "Dark", icon: "moon" }
];

export default function ThemeMenu() {
    const theme = useThemeSnapshot();
    const currentLabel = options.find(
        ({ preference }) => preference === theme.preference
    )?.label;

    const items: MenuItem[] = options.map(({ preference, label, icon }, index) => {
        const selected = theme.preference === preference;

        return {
            id: `theme-${preference}-${index}`,
            label: `${label}${selected ? " ✓" : ""}`,
            icon: createPoprightIcon(icon),
            onSelect: () => themeStore.setPreference(preference)
        };
    });

    return (
        <Dropdown
            className="toolbar-dropdown theme-menu"
            items={items}
            trigger={<Button aria-label={`Theme: ${currentLabel}`}>Theme</Button>}
        />
    );
}
