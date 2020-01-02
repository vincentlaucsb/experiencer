import React, { ReactElement } from "react";
import { Button } from "../Buttons";
import PureMenu, { PureDropdown, PureMenuItem } from "../menus/PureMenu";

export interface ToolbarItemData {
    action?: (event?: React.MouseEvent) => void;
    icon?: string;
    text?: string;
    content?: React.ReactElement;
    shortcut?: string;

    items?: Array<ToolbarItemData>;
    iconMenu?: boolean;
};

export type ToolbarSection = Array<ToolbarItemData>;

export type ToolbarData = Map<string, ToolbarSection>;

export interface ToolbarMakerProps {
    data: ToolbarData;
}

function ToolbarButton(props: ToolbarItemData) {
    let icon = <></>;
    if (props.icon) {
        icon = <i className={`icofont-${props.icon}`} />
    }

    return (
        <PureMenuItem onClick={props.action}>
            <Button
                disabled={!props.action && !props.items}>
                {icon}
                {props.text}
                {props.shortcut}
            </Button>
        </PureMenuItem>
    );
}

/**
 * Factory function for rendering toolbar item
 * @param props
 */
function ToolbarItem(props: ToolbarItemData) {
    if (props.content) {
        return <>{props.content}</>
    }

    if (props.items) {
        return (
            <PureDropdown
                content={<ToolbarButton {...props} />}
                ulProps={{
                    className: props.iconMenu ? "icon-menu" : ""
                }}>
                {props.items.map((value) =>
                    <ToolbarItem {...value} />
                )}
            </PureDropdown>
        );
    }

    return <ToolbarButton {...props} />
}

export default function ToolbarMaker(props: ToolbarMakerProps) {
    return <React.Fragment>
        {Array.from(props.data).map(([key, items]) => {
            return (
                <div className="toolbar-section">
                    <PureMenu horizontal>
                        {items.map((item) =>
                           <ToolbarItem {...item} />
                        )}
                    </PureMenu>
                    <span className="toolbar-label">
                        {key}
                    </span>
                </div>
            );
        })}
    </React.Fragment>
}