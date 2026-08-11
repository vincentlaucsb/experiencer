import type { MouseEvent } from "react";

import { Button } from "@/controls/Buttons";

interface FieldAdderProps {
    compact?: boolean;
    label: string;
    onAdd: () => void;
}

/** Provides a discoverable inline way to add another Entry field. */
export default function FieldAdder({ compact = false, label, onAdd }: FieldAdderProps) {
    const addField = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onAdd();
    };

    return (
        <span className={`entry-field-adder${compact ? " entry-field-adder--compact" : ""} no-print`}>
            <Button
                type="button"
                className="entry-field-adder__trigger"
                variant="primary"
                appearance={compact ? "outline" : "solid"}
                aria-label={label}
                onClick={addField}
            >
                <span aria-hidden="true">+</span>{compact ? null : ` ${label}`}
            </Button>
        </span>
    );
}
