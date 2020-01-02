import PureMenu, { PureDropdown, PureMenuItem } from "../menus/PureMenu";
import React from "react";
import { Button } from "../Buttons";

export interface AccordionMenuProps {
    children: Array<React.ReactElement>;
    collapse: boolean;
    label: React.ReactNode;
}

export default function AccordionMenu(props: AccordionMenuProps) {
    if (props.collapse) {
        return (
            <PureMenu>
                <PureDropdown trigger={
                    <PureMenuItem><Button>{props.label}</Button></PureMenuItem>
                }>
                    {props.children}
                </PureDropdown>
            </PureMenu>
        );
    }

    return (
        <>
            <PureMenu horizontal>
                {props.children}
            </PureMenu>
            <span className="label">{props.label}</span>
        </>
    );
}