export interface BasicToolbarItemData {
    icon?: string;
    /** Optional semantic emphasis for an icon without changing its button variant. */
    iconTone?: "brand";
    items?: BasicToolbarItemData[];
    text?: string;
}

export interface ToolbarItemData extends BasicToolbarItemData {
    onClick?: (() => void) | ((event: React.MouseEvent) => void);

    /** Whether or not text should be hidden when displayed on toolbar */
    condensedButton?: boolean;

    content?: React.ReactElement;
    items?: ToolbarItemData[];
    shortcut?: string;
};
