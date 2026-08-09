import * as React from "react";
import { useEffect } from "react";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";

interface UrlInputProps {
    url?: string;
    onChange: (url: string) => void;
}

export default function UrlInput(props: UrlInputProps) {
    let [url, setUrl] = React.useState(props.url || "");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const inputId = `link-url-${React.useId().replace(/:/g, "")}`;

    // Sync internal state when prop changes (e.g., when switching between links)
    useEffect(() => {
        setUrl(props.url || "");
    }, [props.url]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        props.onChange(url);
        // Defocus the input on Enter
        inputRef.current?.blur();
    }

    const handleBlur = () => {
        props.onChange(url);
    }

    return (
        <form onSubmit={handleSubmit} className="pure-form">
            <fieldset>
                <label htmlFor={inputId}>
                    <span style={{ marginRight: '8px', fontWeight: 'bold' }}>URL:</span>
                </label>
                <input
                    {...nonCredentialInputAttributes}
                    ref={inputRef}
                    id={inputId}
                    type="url"
                    value={url}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="https://example.com"
                />
            </fieldset>
        </form>
    );
}
