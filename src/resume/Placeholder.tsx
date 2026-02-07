import React from "react";

export interface PlaceholderProps {
    text: string;
    alt?: string;
}

export default function Placeholder(props: PlaceholderProps) : JSX.Element {
    if (!props.text) {
        return <span className='resume-default'>
            {props.alt || 'Enter a value here'}
        </span>
    }

    return <>{props.text}</>;
}