import React from "react";

import { Button } from "../Buttons";
import type { ToolbarSection } from "../toolbar/ToolbarMaker";
import PageSize from "@/types/PageSize";

interface PageSizeControlsProps {
    pageSize: PageSize;
    setPageSize: (pageSize: PageSize) => void;
}

function PageSizeControls(props: PageSizeControlsProps) {
    const { pageSize, setPageSize } = props;

    return (
        <div className="page-size-control app-gap-1-5" role="group" aria-label="Page size">
            <span className="page-size-label app-text-light-accent">Size</span>
            <div className="page-size-toggle">
                <Button
                    className={`page-size-option${pageSize === PageSize.Letter ? ' active' : ''}`}
                    onClick={() => setPageSize(PageSize.Letter)}
                >
                    Letter
                </Button>
                <Button
                    className={`page-size-option${pageSize === PageSize.A4 ? ' active' : ''}`}
                    onClick={() => setPageSize(PageSize.A4)}
                >
                    A4
                </Button>
            </div>
        </div>
    );
}

/** Builds the page-size toolbar section in expanded or collapsed layouts. */
export function getPageSetupSection(
    pageSize: PageSize,
    setPageSize: (pageSize: PageSize) => void
): ToolbarSection {
    return {
        icon: "ui-file",
        items: [
            {
                content: <PageSizeControls pageSize={pageSize} setPageSize={setPageSize} />
            }
        ],
        collapsedItems: [
            {
                onClick: pageSize === PageSize.Letter ? undefined : () => setPageSize(PageSize.Letter),
                text: `Letter${pageSize === PageSize.Letter ? ' ✓' : ''}`
            },
            {
                onClick: pageSize === PageSize.A4 ? undefined : () => setPageSize(PageSize.A4),
                text: `A4${pageSize === PageSize.A4 ? ' ✓' : ''}`
            }
        ]
    };
}
