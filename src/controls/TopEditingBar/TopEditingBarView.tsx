import React, { useCallback, useRef, useState } from "react";

import SpecialCharacterPicker from "@/controls/SpecialCharacterPicker";
import Toolbar from "@/controls/toolbar/ToolbarMaker";
import useProgressiveOverflow from "@/shared/hooks/useProgressiveOverflow";

import { projectToolbar } from "./projectToolbar";
import type { TopEditingBarViewProps } from "./types";

/** Renders projected editing controls and bridges the responsive coordinator to the DOM. */
export default function TopEditingBarView(props: TopEditingBarViewProps) {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isSpecialCharacterPickerOpen, setSpecialCharacterPickerOpen] = useState(false);
    const openSpecialCharacterPicker = useCallback(
        () => setSpecialCharacterPickerOpen(true),
        []
    );
    const data = projectToolbar(props, openSpecialCharacterPicker);
    const overflowItems = Array.from(data, ([id, section]) => ({
        id,
        priority: section.collapsePriority
    }));
    const collapsedSections = useProgressiveOverflow(toolbarRef, overflowItems);
    const className = collapsedSections.size > 0
        ? "toolbar-has-collapsed-sections"
        : "";

    return (
        <>
            <SpecialCharacterPicker
                isOpen={isSpecialCharacterPickerOpen}
                close={() => setSpecialCharacterPickerOpen(false)}
            />
            <div ref={toolbarRef} id="toolbar" className={className}>
                <Toolbar
                    data={data}
                    collapse={false}
                    collapsedSections={collapsedSections}
                />
            </div>
        </>
    );
}
