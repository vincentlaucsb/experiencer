import React from "react";

import { ToolbarItemData } from "./ToolbarButton";
import PureMenu from "../menus/PureMenu";
import ToolbarSectionDropdown from "./ToolbarSectionDropdown";
import ToolbarItemFactory from "./ToolbarItemFactory";

export interface ToolbarSection {
    /** Icon that appears on collapsed toolbar */
    icon?: string;
    iconTone?: "brand";
    items: Array<ToolbarItemData>;
    /** Optional compact-menu representation for controls that are not menu items when expanded. */
    collapsedItems?: Array<ToolbarItemData>;
    /** Lower values collapse earlier when the toolbar runs out of room. */
    collapsePriority?: number;
}

export type ToolbarData = Map<string, ToolbarSection>;

export interface ToolbarProps {
    data: ToolbarData;

    /** Determines whether or not to use compact form for every section. */
    collapse: boolean;
    /** Sections that should use their compact dropdown representation. */
    collapsedSections?: ReadonlySet<string>;
}

/**
 * Generate a toolbar described by JavaScript objects
 * @param props
 */
export default function Toolbar(props: ToolbarProps) {
    // Collapsed form
    if (props.collapse) {
        return (
            <PureMenu horizontal>
                {Array.from(props.data).map(([key, section]) =>
                    <ToolbarSectionDropdown
                        key={key}
                        text={key}
                        icon={section.icon}
                        iconTone={section.iconTone}
                        items={section.items}
                    />
                )}
            </PureMenu>
        );
    }

    // Default representation, with optional per-section compaction.
    return <React.Fragment>
        {Array.from(props.data).map(([key, section]) => {
            const isCollapsed = props.collapsedSections?.has(key) || false;
            const priority = section.collapsePriority ?? 50;

            return (
                <div
                    className={`toolbar-section${isCollapsed ? " toolbar-section-collapsed" : ""} app-py-1-5 app-px-2`}
                    data-toolbar-section={key}
                    data-toolbar-collapse-priority={priority}
                    key={key}
                >
                    {isCollapsed ? (
                        <PureMenu horizontal>
                            <ToolbarSectionDropdown
                                text={key}
                                icon={section.icon}
                                iconTone={section.iconTone}
                                items={section.collapsedItems ?? section.items}
                            />
                        </PureMenu>
                    ) : (
                        <PureMenu horizontal>
                            {section.items.map((item: ToolbarItemData, index: number) =>
                                <ToolbarItemFactory key={index} {...item} />
                            )}
                        </PureMenu>
                    )}
                    {isCollapsed ? <></> : (
                        <span className="toolbar-label app-text-light-accent">{key}</span>
                    )}
                </div>
            );
        })}
    </React.Fragment>
}
