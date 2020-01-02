import React, { ReactElement } from "react";
import { Button } from "../Buttons";
import PureMenu, { PureDropdown, PureMenuItem } from "../menus/PureMenu";

export interface ToolbarItemData {
    action?: (event?: React.MouseEvent) => void;
    items?: Array<ToolbarItemData>;
    icon?: string;
    text?: string;
    content?: React.ReactElement;
};

export type ToolbarSection = Array<ToolbarItemData>;

export type ToolbarData = Map<string, ToolbarSection>;

export interface ToolbarMakerProps {
    data: ToolbarData;
}

function ToolbarItem(props: ToolbarItemData) {
    let className = "";
    if (props.text && props.icon) {
        className = "button-text";
    }

    if (props.content) {
        return <>{props.content}</>
    }

    if (props.items) {
        return (
            <PureDropdown content={props.text || props.icon}>
                {props.items.map((value) =>
                    <PureMenuItem>
                        <Button>
                            {value.icon} {value.text}
                        </Button>
                    </PureMenuItem>
                )}
            </PureDropdown>
        );
    }

    return (
        <PureMenuItem>
            <Button
                className={className}
                onClick={props.action}
                disabled={!props.action}>
                <i className={props.icon} />
                {props.text}
            </Button>
        </PureMenuItem>
    );
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