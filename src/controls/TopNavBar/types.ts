import type * as React from "react";
import type { MenuItem } from "popright";

import type { ResumeDocumentSummary } from "@/shared/repositories/ResumeRepository";
import type { Action } from "@/types";

export interface TopNavBarProps {
    isEditing: boolean;

    /** File and output commands. */
    exportHtml: Action;
    exportToPng: Action;
    loadData: (data: object, title?: string) => void;
    saveLocal: Action;
    print: Action;
    fileMenuItems?: MenuItem[];

    /** Document controls. */
    documents?: ResumeDocumentSummary[];
    documentLabels?: Record<string, string>;
    activeDocumentId?: string;
    selectDocument?: (id: string) => void;
    renameDocument?: (id: string, title: string) => Promise<string | null>;
    documentItems?: React.ReactNode;

    /** Shared shell presentation and extensions. */
    saveStatus?: string;
    proBadge?: string;
    accountLabel?: string;
    editingStorage?: "local" | "cloud";
    signOut?: Action;
    signIn?: Action;
    helpMenuItems?: MenuItem[];
    secondaryItems?: React.ReactNode;

    /** Workspace navigation. */
    new: Action;
    toggleLanding: Action;
}

export type TopNavBarWrapperProps = Omit<
    TopNavBarProps,
    "loadData" | "isEditing" | "saveLocal" | "toggleLanding"
> & {
    loadData?: (data: object, title?: string) => void;
    saveLocal?: Action;
    isEditing?: boolean;
};
