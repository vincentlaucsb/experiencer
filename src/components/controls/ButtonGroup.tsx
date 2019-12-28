import React from "react";

export interface ButtonGroupProps extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export default function ButtonGroup(props: ButtonGroupProps) {
    let className = 'pure-button-group';
    if (props.className) {
        className += ` ${props.className}`;
    }

    let newProps = {
        ...props,
        className: className,
        role: "group"
    };

    return (
        <div {...newProps}>
            {props.children}
        </div>
    );
}