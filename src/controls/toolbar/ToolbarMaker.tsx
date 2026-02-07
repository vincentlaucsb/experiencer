import React from "react";

import { ToolbarItemData } from "./ToolbarButton";
import PureMenu from "../menus/PureMenu";
import ToolbarSectionDropdown from "./ToolbarSectionDropdown";
import ToolbarItemFactory from "./ToolbarItemFactory";

export interface ToolbarSection {
    /** Icon that appears on collapsed toolbar */
    icon?: string;
    items: Array<ToolbarItemData>;
}

export type ToolbarData = Map<string, ToolbarSection>;

export interface ToolbarProps {
    data: ToolbarData;

    /** Determines whether or not to use compact form */
    collapse: boolean;
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
                    <ToolbarSectionDropdown key={key} text={key} icon={section.icon} items={section.items} />
                )}
            </PureMenu>
        );
    }

    // Default representation
    return <React.Fragment>
        {Array.from(props.data).map(([key, section]) => {
            return (
                <div className="toolbar-section" key={key}>
                    <PureMenu horizontal>
                        {section.items.map((item: ToolbarItemData, index: number) =>
                            <ToolbarItemFactory key={index} {...item} />
                        )}
                    </PureMenu>
                    <span className="toolbar-label">{key}</span>
                </div>
            );
        })}
    </React.Fragment>
}