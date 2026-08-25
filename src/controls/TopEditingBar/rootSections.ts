import ComponentTypes from "@/resume/schema/ComponentTypes";
import Grid from "@/resume/Grid";
import PageBreak from "@/resume/PageBreak";
import Row from "@/resume/Row";
import Section from "@/resume/Section";
import Column from "@/resume/Column";
import { assignIds } from "@/shared/utils/assignIds";
import addNodeAndEnsureCss from "@/shared/stores/addNodeAndEnsureCss";
import type PageSize from "@/types/PageSize";
import type { ToolbarData } from "@/controls/toolbar/ToolbarMaker";
import { ResumeHotKeyMap } from "@/controls/ResumeHotkeys";

import { getPageSetupSection } from "./pageSetup";
import type { EditingBarProps } from "./types";

/** Projects toolbar sections used while the résumé root is active. */
export function projectRootSections(options: {
    props: EditingBarProps;
    pageSize: PageSize;
    setPageSize: (pageSize: PageSize) => void;
    openSpecialCharacterPicker: () => void;
}): ToolbarData {
    const { props } = options;
    return new Map([
        ["Page Setup", getPageSetupSection(options.pageSize, options.setPageSize)],
        ["Clipboard", {
            icon: "clip-board",
            items: [{
                onClick: props.pasteClipboard,
                icon: "ui-clip-board",
                text: "Paste",
                shortcut: ResumeHotKeyMap.PASTE_SELECTED["sequence"]
            }]
        }],
        ["Resume", {
            items: [
                {
                    icon: "ui-add",
                    text: "Insert",
                    items: [
                        {
                            onClick: () => props.addChild(undefined, assignIds({ type: Section.type })),
                            icon: "book-mark",
                            text: "Section"
                        },
                        {
                            onClick: () => addNodeAndEnsureCss(
                                props.addChild,
                                undefined,
                                assignIds(ComponentTypes.instance.defaultValue(PageBreak.type).node)
                            ),
                            icon: "page-break",
                            text: "Page break"
                        },
                        {
                            onClick: () => props.addChild(
                                undefined,
                                assignIds(ComponentTypes.instance.defaultValue(Row.type).node)
                            ),
                            icon: "swoosh-right",
                            text: "Rows"
                        },
                        {
                            onClick: () => props.addChild(
                                undefined,
                                assignIds(ComponentTypes.instance.defaultValue(Column.type).node)
                            ),
                            icon: "swoosh-down",
                            text: "Columns"
                        },
                        {
                            onClick: () => props.addChild(
                                undefined,
                                assignIds(ComponentTypes.instance.defaultValue(Grid.type).node)
                            ),
                            icon: "table",
                            text: "Grid"
                        }
                    ]
                },
                {
                    onClick: options.openSpecialCharacterPicker,
                    icon: "keyboard",
                    text: "Special characters"
                }
            ]
        }]
    ]);
}
