import type { MouseEvent } from "react";

import { Button } from "@/controls/Buttons";

interface FieldAdderProps {
    label: string;
    onAdd: () => void;
}

/** Provides a discoverable inline way to add another Entry field. */
export default function FieldAdder({ label, onAdd }: FieldAdderProps) {
    const addField = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onAdd();
    };

    return (
        <Button type="button" variant="primary" aria-label={label} onClick={addField}>
            <span aria-hidden="true">+</span>{` ${label}`}
        </Button>
    );
}
