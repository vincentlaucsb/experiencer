import React from "react";

import ToolbarButton, { BasicToolbarItemData, ToolbarItemData, ToolbarButtonProps } from "./ToolbarButton";
import { PureMenuItem, PureDropdown } from "../menus/PureMenu";
import { Button } from "../Buttons";
import ToolbarItemFactory from "./ToolbarItemFactory";

interface ToolbarSectionDropdownProps extends BasicToolbarItemData {
    items: ToolbarItemData[];
    text: string;
}

/**
 * Toolbar section dropdown menu that appears when menu is overflowing
 * @param props
 */
export default function ToolbarSectionDropdown(props: ToolbarSectionDropdownProps) {
    let [activeIndex, setActive] = React.useState(-1);
    let items = props.items;
    let heading = <></>

    if (activeIndex >= 0) {
        items = props.items[activeIndex].items as ToolbarItemData[]
        heading = <PureMenuItem onClick={(event) => event.stopPropagation()}>
            <h3>
                <Button className="back-button" onClick={() => setActive(-1)}>
                    <i className="icofont-rounded-left" />
                </Button>
                <span>{props.items[activeIndex].text}</span>
            </h3>
        </PureMenuItem>
    }

    return (
        <PureDropdown
            ulProps={{ className: "toolbar-collapsed-section" }}
            trigger={<ToolbarButton icon={props.icon} text={props.text} />}>
            {heading}
            {items.map((item, index: number) => {
                // If item contains a group of actions, then turn it 
                // into a trigger that when clicked, replaces the entire
                // dropdown's contents with its own buttons
                if (item.items) {
                    return (
                        <PureMenuItem>
                            <ToolbarButton
                                action={
                                    (event: React.MouseEvent) => {
                                        setActive(index);
                                        event.stopPropagation();
                                    }}
                                dropdownChild={true}
                                icon={item.icon}
                                text={item.text}
                            />
                        </PureMenuItem>
                    );
                }

                return <ToolbarItemFactory
                    {...item}
                    dropdownChild={true}
                />
            })}
        </PureDropdown>
    );
}