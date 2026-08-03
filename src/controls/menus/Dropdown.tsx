import React from "react";
import { DropdownMenu } from "@popright/react";
import type { MenuItem } from "popright";

export interface DropdownProps {
    trigger: React.ReactElement<DropdownTriggerProps>;
    items: MenuItem[];
    className?: string;
    wrapperClassName?: string;
}

interface DropdownTriggerProps {
    onClick?: (event: React.MouseEvent) => void;
    "aria-haspopup"?: "menu";
    "aria-controls"?: string;
    "aria-expanded"?: boolean;
}

export default function Dropdown({ trigger, items, className, wrapperClassName }: DropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const accessibleTrigger = React.cloneElement(trigger, {
        "aria-haspopup": "menu",
        "aria-expanded": isOpen
    });

    return (
        <li className={["pure-menu-item", wrapperClassName].filter(Boolean).join(" ")}>
            <DropdownMenu
                className={className}
                items={items}
                minWidth={180}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
            >
                {accessibleTrigger}
            </DropdownMenu>
        </li>
    );
}
