import React, { ReactElement } from "react";
import { Button } from "./Buttons";

export interface TabProps {
    children: Array<ReactElement>;
}

export default function Tabs(props: TabProps) {
    if (Array.isArray(props.children)) {
        let keys = (props.children).map((node) => {
            if (node.key) {
                return node.key;
            }

            throw new Error("Key for immediate child of Tabs cannot be null");
        });

        let [activeKey, setKey] = React.useState(keys[0]);

        const activeIndex = keys.indexOf(activeKey);

        return <div className="tabs-container">
            <div className="tabs pure-button-group" role="group">
                {keys.map((key) => {
                    const onClick = () => { setKey(key); }
                    const className = (key === activeKey) ? "tabs-button tabs-button-active" : "tabs-button";

                    return (
                        <Button
                            className={className}
                            key={key}
                            onClick={onClick}
                        >{key}</Button>
                    );
                })}
            </div>

            <div className="tabs-children">
                {props.children[activeIndex]}
            </div>
        </div>
    }

    throw new Error("Tabs has no children");
}