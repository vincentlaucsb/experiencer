import React from "react";

import { Button } from "@/controls/Buttons";
import Modal from "@/controls/Modal";
import {
    countLiveCssDeclarationChanges,
    LiveCssTreeChange
} from "@/shared/utils/liveCssSync";

interface LiveCssChangesModalProps {
    changes: ReadonlyArray<LiveCssTreeChange>;
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

interface DeclarationChangeProps {
    change: LiveCssTreeChange;
    property: string;
    type: "Added" | "Changed" | "Removed";
}

function DeclarationChange({ change, property, type }: DeclarationChangeProps) {
    const before = change.previousDeclarations.get(property);
    const after = change.declarations.get(property);

    return (
        <li>
            <span className={`live-css-change-type live-css-change-${type.toLowerCase()}`}>
                {type}
            </span>
            <code>{property}</code>
            {type === "Changed" && (
                <>
                    <span className="live-css-old-value">{before}</span>
                    <span>to</span>
                </>
            )}
            <code>{type === "Removed" ? before : after}</code>
        </li>
    );
}

export default function LiveCssChangesModal(props: LiveCssChangesModalProps) {
    const declarationCount = countLiveCssDeclarationChanges(props.changes);

    return (
        <Modal
            className="live-css-changes-modal"
            close={props.onCancel}
            isOpen={props.isOpen}
            title="Import live CSS changes"
        >
            <div className="live-css-changes-modal-body">
                <p>
                    Review changes made to the live stylesheet before importing them
                    into the editor.
                </p>
                <div className="live-css-change-list">
                    {props.changes.map((change) => (
                        <section
                            className="live-css-rule-change"
                            key={`${change.selector}\u0000${change.path.join("\u0000")}`}
                        >
                            <h4>{change.name}</h4>
                            <code className="live-css-selector">{change.selector}</code>
                            <ul>
                                {change.added.map((property) => (
                                    <DeclarationChange
                                        change={change}
                                        key={`added-${property}`}
                                        property={property}
                                        type="Added"
                                    />
                                ))}
                                {change.changed.map((property) => (
                                    <DeclarationChange
                                        change={change}
                                        key={`changed-${property}`}
                                        property={property}
                                        type="Changed"
                                    />
                                ))}
                                {change.removed.map((property) => (
                                    <DeclarationChange
                                        change={change}
                                        key={`removed-${property}`}
                                        property={property}
                                        type="Removed"
                                    />
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
                <div className="live-css-modal-actions">
                    <Button type="button" onClick={props.onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" primary autoFocus onClick={props.onConfirm}>
                        Import {declarationCount} change{declarationCount === 1 ? "" : "s"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
