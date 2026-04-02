import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ToastState {
    message?: string;
    visible: boolean;

    setToast: (message: string) => void;
    clearToast: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>()(
    devtools(
        (set) => ({
            message: undefined,
            visible: false,
            setToast: (message: string) => set({ message, visible: true }, false, "setToast"),
            clearToast: () => set({ message: undefined, visible: false }, false, "clearToast"),
        }),
        { name: "ToastStore" }
    )
);

export const showToast = (message: string, durationMs = 3200) => {
    if (dismissTimer) {
        clearTimeout(dismissTimer);
    }

    useToastStore.getState().setToast(message);

    dismissTimer = setTimeout(() => {
        useToastStore.getState().clearToast();
        dismissTimer = undefined;
    }, durationMs);
};

export const clearToast = () => {
    if (dismissTimer) {
        clearTimeout(dismissTimer);
        dismissTimer = undefined;
    }

    useToastStore.getState().clearToast();
};
