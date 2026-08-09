import React from "react";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import { ResumeNode } from "@/types";

import "./NodeTreeVisualizer.scss";

export interface NodeTreeVisualizerProps {
    childNodes: Array<ResumeNode>;
    selectNode: (uuid: string) => void;
    selectedNode?: string;  // UUID of selected node
}

/** Represents a resume node in the keyboard-navigable structure tree. */
function NodeRepresentation({ node }: { node: ResumeNode }) {
    const classNames = ["tree-item", ...ComponentTypes.instance.treeClassNames(node.type)];
    const htmlId = node.htmlId ? `#${node.htmlId}` : "";
    const cssClasses = node.classNames ? node.classNames.split(' ').map(
        (name) => `.${name}`).join('') : "";
    const text = ComponentTypes.instance.treeRepresentation(node);

    return (
        <span className={classNames.join(' ')}>{text}
            <span className="tree-item-selector app-pl-2">{htmlId}{cssClasses}</span>
        </span>
    );
}

interface TreeMapperProps {
    root: Array<ResumeNode> | ResumeNode;
    selectNode: (uuid: string) => void;
    selectedNode?: string;
    depth?: number;
}

function getTreeItems(current: HTMLElement) {
    const tree = current.closest<HTMLElement>('[role="tree"]');
    return tree ? Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]')) : [];
}

function focusTreeItem(item: HTMLElement | null | undefined, selectNode: (uuid: string) => void) {
    if (!item) {
        return;
    }

    item.focus();
    const uuid = item.dataset.uuid;
    if (uuid) {
        selectNode(uuid);
    }
}

function handleTreeItemKeyDown(
    event: React.KeyboardEvent<HTMLLIElement>,
    selectNode: (uuid: string) => void
) {
    const current = event.currentTarget;
    const items = getTreeItems(current);
    const currentIndex = items.indexOf(current);

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const uuid = current.dataset.uuid;
        if (uuid) {
            selectNode(uuid);
        }
        return;
    }

    let destination: HTMLElement | null | undefined;
    if (event.key === "ArrowDown") {
        destination = items[currentIndex + 1];
    } else if (event.key === "ArrowUp") {
        destination = items[currentIndex - 1];
    } else if (event.key === "Home") {
        destination = items[0];
    } else if (event.key === "End") {
        destination = items[items.length - 1];
    } else if (event.key === "ArrowRight") {
        destination = current.querySelector<HTMLElement>(':scope > [role="group"] [role="treeitem"]');
    } else if (event.key === "ArrowLeft") {
        destination = current.parentElement?.closest<HTMLElement>('[role="treeitem"]') ?? undefined;
    }

    if (destination) {
        event.preventDefault();
        focusTreeItem(destination, selectNode);
    }
}

function TreeMapper({ root, selectNode, selectedNode, depth = 0 }: TreeMapperProps) {
    let childNodes: Array<ResumeNode> | undefined = undefined;

    if (Array.isArray(root)) {
        childNodes = root;
    } else if (root.childNodes) {
        childNodes = root.childNodes;
    }

    if (childNodes) {
        const nestedMargin = depth > 0 ? " app-ml-4" : "";

        return <ul
            className={`node-tree app-pl-4${nestedMargin}`}
            role={depth === 0 ? "tree" : "group"}
            aria-label={depth === 0 ? "Resume structure" : undefined}
        >
            {childNodes.map((node, index) => {
                const isSelected = selectedNode === node.uuid;
                const className = isSelected ? "tree-item-selected app-py-1" : "app-py-1";
                const isFirstTreeItem = !selectedNode && depth === 0 && index === 0;

                return <li
                    aria-expanded={node.childNodes?.length ? true : undefined}
                    aria-level={depth + 1}
                    aria-selected={isSelected}
                    className={className}
                    data-uuid={node.uuid}
                    key={node.uuid}
                    onClick={(event) => {
                        selectNode(node.uuid);
                        event.stopPropagation();
                    }}
                    onKeyDown={(event) => handleTreeItemKeyDown(event, selectNode)}
                    role="treeitem"
                    tabIndex={isSelected || isFirstTreeItem ? 0 : -1}
                >
                    <NodeRepresentation node={node} />
                    <TreeMapper
                        root={node}
                        selectNode={selectNode}
                        selectedNode={selectedNode}
                        depth={depth + 1}
                    />
                </li>;
            })}
        </ul>;
    }

    return <></>;
}

export default function NodeTreeVisualizer(props: NodeTreeVisualizerProps) {
    return (
        <div>
            <TreeMapper
                root={props.childNodes}
                selectNode={props.selectNode}
                selectedNode={props.selectedNode}
            />
        </div>
    );
}
