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
        const normalizeKey = (key: React.Key) => String(key).toLowerCase().replace(/\s+/g, '-');
        const getTabId = (key: React.Key) => `tabs-tab-${normalizeKey(key)}`;
        const getPanelId = (key: React.Key) => `tabs-panel-${normalizeKey(key)}`;

        const activeTabId = getTabId(activeKey);
        const activePanelId = getPanelId(activeKey);

        return <div className="tabs-container">
            <div className="tabs pure-button-group" role="tablist" aria-label="Editor tabs">
                {keys.map((key) => {
                    const onClick = () => { setKey(key); }
                    const isActive = key === activeKey;
                    const className = (key === activeKey) ? "tabs-button tabs-button-active" : "tabs-button";

                    return (
                        <Button
                            aria-controls={getPanelId(key)}
                            aria-selected={isActive}
                            className={className}
                            id={getTabId(key)}
                            key={key}
                            onClick={onClick}
                            role="tab"
                            tabIndex={isActive ? 0 : -1}
                        >{key}</Button>
                    );
                })}
            </div>

            <div className="tabs-children" aria-labelledby={activeTabId} id={activePanelId} role="tabpanel">
                {props.children[activeIndex]}
            </div>
        </div>
    }

    throw new Error("Tabs has no children");
}