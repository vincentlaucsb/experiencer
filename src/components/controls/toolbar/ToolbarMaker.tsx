import React, { ReactElement } from "react";
import { Button } from "../Buttons";
import PureMenu from "../menus/PureMenu";

export interface ToolbarItem {
    action?: (event?: React.MouseEvent) => void;
    icon?: string;
    label?: string;
    content?: React.ReactElement;
};

export type ToolbarSection = Array<ToolbarItem>;

export type ToolbarData = Map<string, ToolbarSection>;

export interface ToolbarMakerProps {
    data: ToolbarData;
}

export default function ToolbarMaker(props: ToolbarMakerProps) {
    const Item = (props: ToolbarItem) => {
        let className = "";
        if (props.label && props.icon) {
            className = "button-text";
        }

        if (props.content) {
            return <>{props.content}</>
        }

        return (
            <Button
                className={className}
                onClick={props.action}
                disabled={!props.action}
            >
                <i className={props.icon} />
                {props.label}
            </Button>
        );
    };


    return <React.Fragment>
        {Array.from(props.data).map(([key, items]) => {
            return (
                <div className="toolbar-section">
                    <PureMenu horizontal>
                        {items.map((item) =>
                           <Item {...item} />
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