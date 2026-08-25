import * as React from "react";

import ExperiencerMark from "@/assets/brand/experiencer-mark-on-dark.svg?url";
import { Button } from "@/controls/Buttons";
import PureMenu from "@/controls/menus/PureMenu";
import ThemeMenu from "@/controls/ThemeMenu";
import useProgressiveOverflow from "@/shared/hooks/useProgressiveOverflow";
import { measureHorizontalChildOverflow } from "@/shared/utils/overflow";
import loadData from "@/shared/stores/loadData";
import { saveLocal } from "@/shared/stores/saveResume";
import { isEditingMode, workspaceStore } from "@/shared/stores/workspaceStore";
import { useWorkspaceSnapshot } from "@/shared/stores/workspaceStoreHooks";

import "./TopNavBar.scss";
import AccountControls from "./AccountControls";
import DocumentMenu from "./DocumentMenu";
import FileMenu from "./FileMenu";
import HelpMenu from "./HelpMenu";
import type { TopNavBarProps, TopNavBarWrapperProps } from "./types";

export type { TopNavBarProps, TopNavBarWrapperProps } from "./types";

const NAV_OVERFLOW_STEPS = [
    { id: "wordmark", priority: 0 },
    { id: "account-details", priority: 1 },
    { id: "control-labels", priority: 2 },
    { id: "document-selector", priority: 3 }
] as const;

/** Composes the responsive editor navigation shell from focused child controls. */
export function TopNavBar(props: TopNavBarProps) {
    const brandRef = React.useRef<HTMLDivElement>(null);
    const collapsedNavSteps = useProgressiveOverflow(
        brandRef,
        NAV_OVERFLOW_STEPS,
        measureHorizontalChildOverflow
    );
    const navDensity = collapsedNavSteps.size;

    const onBrandKeyDown = (event: React.KeyboardEvent<HTMLHeadingElement>) => {
        if (props.landingNavigationDisabled) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            props.toggleLanding();
        }
    };

    return (
        <div
            id="brand"
            ref={brandRef}
            data-nav-density={navDensity}
            className={`app-px-1 ${props.isEditing ? "is-editing" : "is-landing"}`}
        >
            <div className="brand-primary">
                <h1
                    aria-label="Go to landing page"
                    aria-disabled={props.landingNavigationDisabled || undefined}
                    className="app-m-3"
                    onClick={props.landingNavigationDisabled ? undefined : props.toggleLanding}
                    onKeyDown={onBrandKeyDown}
                    role="button"
                    tabIndex={props.landingNavigationDisabled ? -1 : 0}
                >
                    <img
                        className="brand-mark"
                        src={ExperiencerMark}
                        alt=""
                        aria-hidden="true"
                    />
                    <span className="brand-wordmark">Experiencer</span>
                </h1>
                {props.proBadge ? <span className="pro-badge">{props.proBadge}</span> : <></>}
                <PureMenu id="top-menu" horizontal divProps={{ className: "app-ml-4" }}>
                    {props.isEditing ? (
                        <>
                            <FileMenu
                                exportHtml={props.exportHtml}
                                exportToPng={props.exportToPng}
                                extensionItems={props.fileMenuItems}
                                loadData={props.loadData}
                                newDocument={props.new}
                                print={props.print}
                                saveLocal={props.saveLocal}
                            />
                            <ThemeMenu compact={navDensity >= 3} />
                        </>
                    ) : <></>}
                    <HelpMenu extensionItems={props.helpMenuItems} />
                    {props.isEditing ? (
                        <>
                            {props.documentItems}
                            {props.documents?.length ? (
                                <DocumentMenu
                                    activeDocumentId={props.activeDocumentId}
                                    documentLabels={props.documentLabels}
                                    documents={props.documents}
                                    renameDocument={props.renameDocument}
                                    selectDocument={props.selectDocument}
                                />
                            ) : <></>}
                        </>
                    ) : <></>}
                </PureMenu>
            </div>
            <AccountControls
                accountLabel={props.accountLabel}
                editingStorage={props.editingStorage}
                isEditing={props.isEditing}
                saveStatus={props.saveStatus}
                secondaryItems={props.secondaryItems}
                signIn={props.signIn}
                signOut={props.signOut}
            />
        </div>
    );
}

/** Supplies the OSS workspace and local-file defaults to the navigation view. */
export default function TopNavBarWrapper(props: TopNavBarWrapperProps) {
    const workspace = useWorkspaceSnapshot();
    const isEditing = props.isEditing ?? isEditingMode(workspace.mode);
    const loadImportedData = (data: object) => loadData(data);

    return (
        <TopNavBar
            {...props}
            loadData={props.loadData ?? loadImportedData}
            isEditing={isEditing}
            toggleLanding={() => workspaceStore.showLanding()}
            saveLocal={props.saveLocal ?? saveLocal}
        />
    );
}
