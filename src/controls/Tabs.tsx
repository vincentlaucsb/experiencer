import React, { ReactElement } from "react";

import "./Tabs.scss";

import { Button } from "./Buttons";

export interface TabProps {
    children: React.ReactNode;
}

export default function Tabs(props: TabProps) {
    const children = flattenChildren(props.children);
    if (children.length === 0) {
        throw new Error("Tabs has no children");
    }

    const keys = children.map((node) => {
        if (node.key) {
            return node.key;
        }

        throw new Error("Key for immediate child of Tabs cannot be null");
    });

    const [activeKey, setKey] = React.useState(keys[0]);
    const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    const idPrefix = React.useId().replace(/:/g, "");
    const activeIndex = keys.indexOf(activeKey);
    const getTabId = (index: number) => `${idPrefix}-tab-${index}`;
    const getPanelId = (index: number) => `${idPrefix}-panel-${index}`;

    React.useEffect(() => {
        if (activeIndex < 0) {
            setKey(keys[0]);
        }
    }, [activeIndex, keys]);

    const focusTab = (index: number) => {
        setKey(keys[index]);
        tabRefs.current[String(index)]?.focus();
    };

    const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        let nextIndex: number | undefined;
        if (event.key === "ArrowRight") {
            nextIndex = (index + 1) % keys.length;
        } else if (event.key === "ArrowLeft") {
            nextIndex = (index - 1 + keys.length) % keys.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = keys.length - 1;
        }

        if (nextIndex !== undefined) {
            event.preventDefault();
            focusTab(nextIndex);
        }
    };

    const activeTabId = getTabId(activeIndex);
    const activePanelId = getPanelId(activeIndex);

    return <div className="tabs-container">
        <div className="tabs pure-button-group" role="tablist" aria-label="Editor tabs" aria-orientation="horizontal">
            {keys.map((key, index) => {
                const isActive = key === activeKey;
                const className = isActive ? "tabs-button tabs-button-active" : "tabs-button";

                return (
                    <Button
                        aria-controls={getPanelId(index)}
                        aria-selected={isActive}
                        className={className}
                        id={getTabId(index)}
                        key={key}
                        onClick={() => setKey(key)}
                        onKeyDown={(event) => handleTabKeyDown(event, index)}
                        ref={(element) => { tabRefs.current[String(index)] = element; }}
                        role="tab"
                        tabIndex={isActive ? 0 : -1}
                    >{key}</Button>
                );
            })}
        </div>

        <div className="tabs-children app-p-4" aria-labelledby={activeTabId} id={activePanelId} role="tabpanel" tabIndex={0}>
            {children[activeIndex]}
        </div>
    </div>;
}

function flattenChildren(children: React.ReactNode): ReactElement[] {
    if (Array.isArray(children)) {
        return children.flatMap(flattenChildren);
    }
    return React.isValidElement(children) ? [children] : [];
}
