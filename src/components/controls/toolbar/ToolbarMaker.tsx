﻿import React from "react";
import { Button } from "../Buttons";
import PureMenu, { PureDropdown, PureMenuItem } from "../menus/PureMenu";
import IconicMenuItem from "../menus/MenuItem";

export interface ToolbarItemData {
    action?: (() => void) | ((event: React.MouseEvent) => void);

    /** Whether or not text should be hidden when displayed on toolbar */
    condensedButton?: boolean;
    icon?: string;
    text?: string;
    content?: React.ReactElement;
    shortcut?: string;

    items?: Array<ToolbarItemData>;
};

export type ToolbarSection = Array<ToolbarItemData>;
export type ToolbarData = Map<string, ToolbarSection>;

function ToolbarButton(props: ToolbarItemData) {
    const text = props.condensedButton ? undefined : props.text;

    return (
        <IconicMenuItem
            disabled={!props.action && !props.items}
            onClick={props.action}
            icon={props.icon}
            shortcut={props.shortcut}
            text={text}
        />
    );
}

interface ToolbarItemProps extends ToolbarItemData {
    // isOverflowing?: boolean;
}

/**
 * Factory function for rendering toolbar item
 * @param props
 */
function ToolbarItem(props: ToolbarItemProps) {
    if (Object.keys(props).length === 0) {
        return <></>
    }

    if (props.content) {
        return <>{props.content}</>
    }
    
    if (props.items) {
        return (
            <PureDropdown
                trigger={<ToolbarButton {...props} />}>
                {props.items.map((value) =>
                    <ToolbarItem {...value} />
                )}
            </PureDropdown>
        );
    }

    return <ToolbarButton {...props} />
}

interface OverflowMenuProps {
    text: string;
    items: ToolbarItemData[];
}

interface OverflowItemProps extends ToolbarItemProps {
    index: number;
}

// TODO: Refactor
function OverflowMenu(props: OverflowMenuProps) {
    let [activeIndex, setActive] = React.useState(-1);

    const OverflowItem = (props: OverflowItemProps) => {
        if (props.items) {
            return <ToolbarButton {...props} action={
                (event: React.MouseEvent) => {
                    setActive(props.index);
                    event.stopPropagation();
                }}
                condensedButton={false}
            />
        }

        return <ToolbarItem {...props} condensedButton={false} />
    }

    let children = <React.Fragment>
        {props.items.map((item, index: number) =>
            <OverflowItem {...item} index={index} />)}
    </React.Fragment>    
    
    if (activeIndex >= 0) {
        if (props.items && props.items[activeIndex] && props.items[activeIndex].items) {
            const items = props.items[activeIndex].items;
            if (items) {
                children = <React.Fragment>
                    <PureMenuItem>
                        <Button onClick={(event) => {
                            setActive(-1);
                            event.stopPropagation();
                        }}>Back</Button>
                    </PureMenuItem>
                    {items.map((item, index: number) =>
                        <ToolbarButton {...item} condensedButton={false} />
                    )}
                </React.Fragment>
            }
        }
    }

    return <PureDropdown trigger={<Button>{props.text}</Button>}>
        {children}
    </PureDropdown>
}

export interface ToolbarMakerProps {
    data: ToolbarData;
    isOverflowing: boolean;
}

export default function ToolbarMaker(props: ToolbarMakerProps) {
    if (props.isOverflowing) {
        return (
            <PureMenu horizontal>
                {Array.from(props.data).map(([key, items]) =>
                    <OverflowMenu key={key} text={key} items={items} />
                )}
            </PureMenu>
        );
    }

    return <React.Fragment>
        {Array.from(props.data).map(([key, items]) => {
            return (
                <div className="toolbar-section" key={key}>
                    <PureMenu horizontal>
                        {items.map((item: ToolbarItemData, index: number) =>
                            <ToolbarItem key={index} {...item} />
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