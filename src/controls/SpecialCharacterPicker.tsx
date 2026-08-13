import React from "react";

import { Button } from "./Buttons";
import Modal from "./Modal";

import "./SpecialCharacterPicker.scss";

const SPECIAL_CHARACTERS = [
    { character: "—", name: "Em dash" },
    { character: "–", name: "En dash" },
    { character: "•", name: "Bullet" },
    { character: "…", name: "Ellipsis" },
    { character: "“", name: "Opening double quote" },
    { character: "”", name: "Closing double quote" },
    { character: "‘", name: "Opening single quote" },
    { character: "’", name: "Closing single quote" },
    { character: "©", name: "Copyright" },
    { character: "®", name: "Registered trademark" },
    { character: "™", name: "Trademark" },
    { character: "→", name: "Right arrow" }
];

async function copyToClipboard(value: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
}

interface SpecialCharacterPickerProps {
    isOpen: boolean;
    close: () => void;
}

/** Provides a small, clipboard-focused symbol palette for editor text fields. */
export default function SpecialCharacterPicker(props: SpecialCharacterPickerProps) {
    const [copiedCharacter, setCopiedCharacter] = React.useState<string>();

    React.useEffect(() => {
        if (!props.isOpen) {
            setCopiedCharacter(undefined);
        }
    }, [props.isOpen]);

    const copyCharacter = async (character: string) => {
        await copyToClipboard(character);
        setCopiedCharacter(character);
    };

    return (
        <Modal
            isOpen={props.isOpen}
            title="Special characters"
            close={props.close}
            className="special-character-modal"
        >
            <div className="special-character-picker">
                <p className="special-character-picker__hint">
                    Select a character to copy it to the clipboard.
                </p>
                <div className="special-character-picker__grid" role="list">
                    {SPECIAL_CHARACTERS.map(({ character, name }) => (
                        <Button
                            className="special-character-picker__character"
                            key={name}
                            type="button"
                            aria-label={`${name}: ${character}`}
                            title={`${name} (${character})`}
                            onClick={() => void copyCharacter(character)}
                        >
                            {character}
                        </Button>
                    ))}
                </div>
                <p className="special-character-picker__status" role="status" aria-live="polite">
                    {copiedCharacter ? `Copied ${copiedCharacter}` : ""}
                </p>
            </div>
        </Modal>
    );
}
