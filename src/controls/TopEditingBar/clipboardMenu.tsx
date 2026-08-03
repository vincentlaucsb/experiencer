import { ResumeHotKeyMap } from "../ResumeHotkeys";
import type { SelectedNodeActions } from "../SelectedNodeActions";
import type { ToolbarItemData } from "../toolbar/ToolbarButton";

type ClipboardActions = Pick<
    SelectedNodeActions,
    "copyClipboard" | "cutClipboard" | "pasteClipboard" | "duplicateBefore" | "duplicateAfter"
>;

/** Builds clipboard actions for the selected-node toolbar section. */
export default function getClipboardMenu(actions: ClipboardActions): ToolbarItemData[] {
    const getShortcut = (key: string): string => ResumeHotKeyMap[key]["sequence"];

    return [
        {
            text: "Cut",
            icon: "ui-cut",
            onClick: actions.cutClipboard,
            shortcut: getShortcut("CUT_SELECTED")
        },
        {
            text: "Copy",
            icon: "ui-copy",
            onClick: actions.copyClipboard,
            shortcut: getShortcut("COPY_SELECTED")
        },
        {
            text: "Paste",
            icon: "ui-clip-board",
            onClick: actions.pasteClipboard,
            shortcut: getShortcut("PASTE_SELECTED")
        },
        {
            separator: true
        },
        {
            text: "Insert Copy Before",
            icon: "ui-copy",
            onClick: actions.duplicateBefore
        },
        {
            text: "Insert Copy After",
            icon: "ui-copy",
            onClick: actions.duplicateAfter
        }
    ];
}
