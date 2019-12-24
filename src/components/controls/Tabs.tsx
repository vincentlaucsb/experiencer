import React from "react";

export default function Tabs(props: any) {
    const keys = (props.children).map(
        (node) => node.key);
    let [activeKey, setKey] = React.useState(keys[0]);

    const activeIndex = keys.indexOf(activeKey);

    return <div>
        {keys.map((key) => {
            const onClick = (event) => {
                setKey(key);
            }

            return <button onClick={onClick}>{key}</button>
        })}

        {props.children[activeIndex]}
    </div>
}