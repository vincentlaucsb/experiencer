import React from "react";

import ToolbarButton, { ToolbarItemData } from "./ToolbarButton";
import { PureDropdown, PureMenuItem } from "../menus/PureMenu";

export interface ToolbarItemProps extends ToolbarItemData {
    dropdownChild?: boolean;
}

/**
 * Factory function for rendering toolbar items
 * @param props
 */
export default function ToolbarItemFactory(props: ToolbarItemProps) {
    if (props.content) {
        return <PureMenuItem>{props.content}</PureMenuItem>
    }

    if (!props.icon && !props.text) {
        return <></>
    }
    
    /** Group of buttons */
    if (props.items) {
        return (
            <PureDropdown
                trigger={<ToolbarButton icon={props.icon} text={props.text} />}>
                {props.items.map((value, index) =>
                    <ToolbarItemFactory key={index} dropdownChild={true} {...value} />
                )}
            </PureDropdown>
        );
    }

    return (
        <PureMenuItem>
            <ToolbarButton
                {...props}
                disabled={!props.action && !props.items}
            />
        </PureMenuItem>
    );
}