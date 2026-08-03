import React from "react";

const MDEditor = (props: any) => (
    <textarea
        {...props.textareaProps}
        value={props.value ?? ""}
        onChange={(event) => props.onChange?.(event.target.value, event)}
    />
);

export default MDEditor;
