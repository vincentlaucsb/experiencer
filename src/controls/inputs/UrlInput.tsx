import * as React from "react";
import { useEffect } from "react";

interface UrlInputProps {
    url?: string;
    onChange: (url: string) => void;
}

export default function UrlInput(props: UrlInputProps) {
    let [url, setUrl] = React.useState(props.url || "");
    const inputRef = React.useRef<HTMLInputElement>(null);

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
                <label htmlFor="link-url">
                    <span style={{ marginRight: '8px', fontWeight: 'bold' }}>URL:</span>
                </label>
                <input
                    ref={inputRef}
                    id="link-url"
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
