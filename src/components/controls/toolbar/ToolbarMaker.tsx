import React from "react";
import { Button } from "../Buttons";
import PureMenu, { PureDropdown, PureMenuItem } from "../menus/PureMenu";
import IconicMenuItem from "../menus/MenuItem";

export interface BasicToolbarItemData {
    icon?: string;
    items?: Array<ToolbarItemData>;
    text?: string;
}

export interface ToolbarItemData extends BasicToolbarItemData {
    action?: (() => void) | ((event: React.MouseEvent) => void);

    /** Whether or not text should be hidden when displayed on toolbar */
    condensedButton?: boolean;
    
    content?: React.ReactElement;
    shortcut?: string;
};

export interface ToolbarSection {
    /** Icon that appears on collapsed toolbar */
    icon?: string;

    items: Array<ToolbarItemData>;
}

export type ToolbarData = Map<string, ToolbarSection>;

function ToolbarItem(props: ToolbarItemData) {
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

/**
 * Factory function for rendering toolbar items
 * @param props
 */
function ToolbarItemFactory(props: ToolbarItemData) {
    if (props.content) {
        return <>{props.content}</>
    }

    if (!props.icon && !props.text) {
        return <></>
    }

    const className = props.text ? "toolbar-button-has-text" : "toolbar-button";
    const icon = props.icon ? <i className={`icofont-${props.icon}`} /> : <></>
    const text = props.text && !props.condensedButton ? props.text : "";

    if (props.items) {
        return (
            <PureDropdown
                trigger={<Button className={className}>{icon} {text}</Button>}>
                {props.items.map((value) =>
                    <ToolbarItemFactory {...value} />
                )}
            </PureDropdown>
        );
    }

    return <ToolbarItem {...props} />
}

interface SectionDropdownProps extends BasicToolbarItemData {
    items: ToolbarItemData[];
    text: string;
}

/**
 * Toolbar section dropdown menu that appears when menu is overflowing
 * @param props
 */
function SectionDropdown(props: SectionDropdownProps) {
    let [activeIndex, setActive] = React.useState(-1);
    
    let items = props.items;
    let heading = <></>
    if (activeIndex >= 0) {
        items = props.items[activeIndex].items as ToolbarItemData[]
        heading = <PureMenuItem onClick={(event) => event.stopPropagation()}>
            <h3>
                <Button onClick={() => setActive(-1)}><i className="icofont-rounded-left" /></Button>
                <span>{props.items[activeIndex].text}</span>
            </h3>
        </PureMenuItem>
    }

    const className = props.text ? "toolbar-button-has-text" : "toolbar-button";
    const icon = props.icon ? <i className={`icofont-${props.icon}`} /> : <></>
    return <PureDropdown
        ulProps={{ className: "toolbar-collapsed-section" }}
        trigger={<Button className={className}>{icon} {props.text}</Button>}>
        {heading}
        {items.map((item, index: number) => {
            // If item contains a group of actions, then turn it 
            // into a trigger that when clicked, replaces the entire
            // dropdown's contents with its own buttons
            if (item.items) {
                return <ToolbarItem {...item} action={
                    (event: React.MouseEvent) => {
                        setActive(index);
                        event.stopPropagation();
                    }}
                    condensedButton={false}
                />
            }

            return <ToolbarItemFactory {...item} condensedButton={false} />
        })}
    </PureDropdown>
}

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
                    <SectionDropdown key={key} text={key} icon={section.icon} items={section.items} />
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