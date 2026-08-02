import type { MouseEvent } from "react";

import { Button } from "@/controls/Buttons";

interface FieldAdderProps {
    compact?: boolean;
    onAdd: () => void;
}

/** Provides a discoverable inline way to add another Entry field. */
export default function FieldAdder({ compact = false, onAdd }: FieldAdderProps) {
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
                aria-label="Add field"
                onClick={addField}
            >
                <span aria-hidden="true">+</span>{compact ? null : " Add field"}
            </Button>
        </span>
    );
}
