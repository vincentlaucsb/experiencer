import React from "react";

import Modal from "@/controls/Modal";
import "./KeyboardShortcutsModal.scss";

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    close: () => void;
}

type Shortcut = readonly [label: string, ...keys: string[]];

interface ShortcutGroup {
    title: string;
    shortcuts: readonly Shortcut[];
}

const shortcutGroups: readonly ShortcutGroup[] = [
    {
        title: "Selection and editing",
        shortcuts: [
            ["Copy selected node", "Ctrl", "C"],
            ["Cut selected node", "Ctrl", "X"],
            ["Paste as a child of the selected node", "Ctrl", "V"],
            ["Delete selected node", "Delete"]
        ]
    },
    {
        title: "Document editing",
        shortcuts: [
            ["Save the current document", "Ctrl", "S"],
            ["Undo", "Ctrl", "Z"],
            ["Redo", "Ctrl", "Y"]
        ]
    },
    {
        title: "Application navigation",
        shortcuts: [
            ["Clear the selection and return to editing", "Escape"]
        ]
    }
];

/** Presents the registered editor shortcuts without owning their command behavior. */
export default function KeyboardShortcutsModal(props: KeyboardShortcutsModalProps) {
    return (
        <Modal
            isOpen={props.isOpen}
            title="Keyboard shortcuts"
            close={props.close}
            className="keyboard-shortcuts-modal"
        >
            <div className="keyboard-shortcuts">
                {shortcutGroups.map((group) => (
                    <section key={group.title}>
                        <h4>{group.title}</h4>
                        <dl>
                            {group.shortcuts.map(([label, ...keys]) => (
                                <React.Fragment key={label}>
                                    <dt>{label}</dt>
                                    <dd aria-label={keys.join(" plus ")}>
                                        {keys.map((key, index) => (
                                            <React.Fragment key={key}>
                                                {index > 0 ? <span aria-hidden="true"> + </span> : null}
                                                <kbd>{key}</kbd>
                                            </React.Fragment>
                                        ))}
                                    </dd>
                                </React.Fragment>
                            ))}
                        </dl>
                    </section>
                ))}
            </div>
        </Modal>
    );
}
