import Dropdown from "../menus/Dropdown";
import ToolbarButton, { BasicToolbarItemData, ToolbarItemData } from "./ToolbarButton";
import { toPoprightMenuItems } from "./toPoprightMenuItems";

interface ToolbarSectionDropdownProps extends BasicToolbarItemData {
    items: ToolbarItemData[];
    text: string;
}

/** Toolbar section dropdown that delegates nested navigation to Popright. */
export default function ToolbarSectionDropdown(props: ToolbarSectionDropdownProps) {
    return (
        <Dropdown
            items={toPoprightMenuItems(props.items, "section")}
            trigger={<ToolbarButton
                icon={props.icon}
                iconTone={props.iconTone}
                text={props.text}
                dropdownTrigger
            />}
        />
    );
}
