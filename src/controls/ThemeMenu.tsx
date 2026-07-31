import React from "react";

import { Button } from "./Buttons";
import Dropdown from "./menus/Dropdown";
import { PureMenuItem } from "./menus/PureMenu";
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

    return (
        <Dropdown
            className="toolbar-dropdown theme-menu"
            trigger={
                <Button aria-label={`Theme: ${currentLabel}`}>
                    Theme
                </Button>
            }
        >
            {options.map(({ preference, label, icon }) => {
                const selected = theme.preference === preference;

                return (
                    <PureMenuItem key={preference} selected={selected}>
                        <Button
                            aria-pressed={selected}
                            onClick={() => themeStore.setPreference(preference)}
                        >
                            <div>
                                <i className={`icofont-${icon}`} aria-hidden="true" />
                                <span className="button-text">{label}</span>
                                <span
                                    className="theme-menu__selected"
                                    aria-hidden="true"
                                >
                                    {selected ? "✓" : ""}
                                </span>
                            </div>
                        </Button>
                    </PureMenuItem>
                );
            })}
        </Dropdown>
    );
}
