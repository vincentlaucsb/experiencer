import * as React from "react";

interface UrlInputProps {
    url?: string;
    onChange: (url: string) => void;
}

export default function UrlInput(props: UrlInputProps) {
    let [url, setUrl] = React.useState(props.url || "");
    const inputRef = React.useRef<HTMLInputElement>(null);

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
                    style={{
                        width: '300px',
                        padding: '6px 10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                />
            </fieldset>
        </form>
    );
}
