import "./Toast.scss";

import { useToastStore } from "@/shared/stores/toastStore";

export default function Toast() {
    const message = useToastStore((state) => state.message);
    const visible = useToastStore((state) => state.visible);

    if (!visible || !message) {
        return null;
    }

    return (
        <div className="app-toast no-print" role="status" aria-live="polite">
            {message}
        </div>
    );
}
