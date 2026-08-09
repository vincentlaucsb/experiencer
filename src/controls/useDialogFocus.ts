import { RefObject, useEffect, useRef } from "react";

interface DialogFocusOptions {
    dialogRef: RefObject<HTMLElement | null>;
    isOpen: boolean;
    onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not(:disabled)",
    "input:not(:disabled):not([type=hidden])",
    "select:not(:disabled)",
    "textarea:not(:disabled)",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

/** Adds focus containment, Escape handling, and focus restoration to custom dialogs. */
export default function useDialogFocus({ dialogRef, isOpen, onClose }: DialogFocusOptions) {
    const previousFocus = useRef<HTMLElement | null>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        previousFocus.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const dialog = dialogRef.current;
        if (!dialog) {
            return undefined;
        }

        const focusInitialControl = () => {
            const initial = dialog.querySelector<HTMLElement>("[data-dialog-autofocus]")
                ?? dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
            (initial ?? dialog).focus();
        };

        const frame = window.requestAnimationFrame(focusInitialControl);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onCloseRef.current();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
            if (focusable.length === 0) {
                event.preventDefault();
                dialog.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            window.cancelAnimationFrame(frame);
            document.removeEventListener("keydown", onKeyDown);
            if (previousFocus.current?.isConnected) {
                previousFocus.current.focus();
            }
        };
    }, [dialogRef, isOpen]);
}
