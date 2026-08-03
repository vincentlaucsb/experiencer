import React from "react";

import Dropdown from "../menus/Dropdown";
import ToolbarButton, { ToolbarItemData } from "./ToolbarButton";
import { PureMenuItem } from "../menus/PureMenu";
import { toPoprightMenuItems } from "./toPoprightMenuItems";

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
            <Dropdown
                items={toPoprightMenuItems(props.items)}
                trigger={<ToolbarButton icon={props.icon} iconTone={props.iconTone} text={props.text} />}>
            </Dropdown>
        );
    }

    return (
        <PureMenuItem>
            <ToolbarButton
                {...props}
                disabled={!props.onClick && !props.items}
            />
        </PureMenuItem>
    );
}
