import * as React from "react";
import type { MenuItem } from "popright";

import { Button } from "@/controls/Buttons";
import FileLoader from "@/controls/FileLoader";
import Modal from "@/controls/Modal";
import Dropdown from "@/controls/menus/Dropdown";
import { createPoprightIcon } from "@/controls/menus/poprightMenu";
import { saveAsDialogStore } from "@/shared/stores/saveAsDialogStore";
import type { Action } from "@/types";

interface FileMenuProps {
    exportHtml: Action;
    exportToPng: Action;
    extensionItems?: MenuItem[];
    loadData: (data: object, title?: string) => void;
    newDocument: Action;
    print: Action;
    saveLocal: Action;
}

/** Owns File-menu presentation and its local file-import dialog. */
export default function FileMenu(props: FileMenuProps) {
    const [isLoadOpen, setLoadOpen] = React.useState(false);
    const closeLoad = () => setLoadOpen(false);
    const items: MenuItem[] = [
        {
            id: "new",
            label: "New",
            icon: createPoprightIcon("paper"),
            onSelect: () => props.newDocument()
        },
        {
            id: "load",
            label: "Load",
            icon: createPoprightIcon("folder-open"),
            onSelect: () => setLoadOpen(true)
        },
        {
            id: "save",
            label: "Save",
            shortcut: "Ctrl + S",
            onSelect: () => props.saveLocal()
        },
        ...(props.extensionItems ?? []),
        {
            id: "save-as",
            label: "Save As",
            shortcut: "Ctrl + Shift + S",
            icon: createPoprightIcon("save"),
            onSelect: saveAsDialogStore.open
        },
        {
            id: "export-html",
            label: "Export HTML/CSS package",
            icon: createPoprightIcon("file-html5"),
            onSelect: () => props.exportHtml()
        },
        {
            id: "export-png",
            label: "Export to PNG",
            icon: createPoprightIcon("image"),
            onSelect: () => props.exportToPng()
        },
        {
            id: "print",
            label: "Print",
            shortcut: "Ctrl + P",
            icon: createPoprightIcon("printer"),
            onSelect: () => props.print()
        }
    ];

    return (
        <>
            <Modal
                isOpen={isLoadOpen}
                title="Load File"
                close={closeLoad}
                className="top-nav-modal file-loader-modal"
            >
                <FileLoader close={closeLoad} loadData={props.loadData} />
            </Modal>
            <Dropdown
                className="toolbar-dropdown"
                items={items}
                trigger={(
                    <Button aria-label="File">
                        <i className="icofont-file" aria-hidden="true" />
                        <span className="top-nav-trigger-label">File</span>
                    </Button>
                )}
            />
        </>
    );
}
