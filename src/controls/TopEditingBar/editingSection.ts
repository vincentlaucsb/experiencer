import type { ToolbarItemData } from "@/types/toolbar";

import type { EditingBarProps } from "./types";

/** Projects document-level editing commands without reading application stores. */
export function projectEditingItems(props: EditingBarProps): ToolbarItemData[] {
    return [
        {
            onClick: props.saveLocal,
            icon: "save",
            text: "Save",
            condensedButton: true
        },
        {
            onClick: props.undo,
            icon: "undo",
            text: "Undo",
            condensedButton: true
        },
        {
            onClick: props.redo,
            icon: "redo",
            text: "Redo",
            condensedButton: true
        }
    ];
}
