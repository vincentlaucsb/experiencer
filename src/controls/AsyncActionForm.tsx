import * as React from "react";
import { Button } from "@/controls/Buttons";

export interface AsyncActionFormProps extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    "onSubmit"
> {
    save: () => Promise<string | null>;
    cancel: () => void;
}

export default function AsyncActionForm({
    save,
    cancel,
    children,
    ...formProps
}: AsyncActionFormProps) {
    const [error, setError] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSaving) {
            return;
        }

        setError(null);
        setIsSaving(true);
        try {
            setError(await save());
        } catch {
            setError("Could not save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form
            {...formProps}
            aria-busy={isSaving || undefined}
            onSubmit={(event) => void submit(event)}
        >
            {children}
            {error ? (
                <p className="async-action-form-error" role="alert">
                    {error}
                </p>
            ) : null}
            <div className="async-action-form-actions">
                <Button disabled={isSaving} type="submit" variant="primary">
                    {isSaving ? "Saving…" : "Save"}
                </Button>
                <Button disabled={isSaving} type="button" onClick={cancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
