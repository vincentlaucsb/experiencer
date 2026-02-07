import Entry, { BasicEntryProps } from "@/resume/Entry";
import React from "react";
import Section from "@/resume/Section";
import { ResumeNode } from "@/types";

export interface NodeTreeVisualizerProps {
    childNodes: Array<ResumeNode>;
    selectNode: (uuid: string) => void;
    selectedNode?: string;  // UUID of selected node
}

/**
 * Represent a resume node on the tree
 */
function represent(node: ResumeNode): JSX.Element {
    let classNames = ["tree-item"];
    let htmlId = node.htmlId ? `#${node.htmlId}` : "";
    let cssClasses = node.classNames ? node.classNames.split(' ').map(
        (name) => `.${name}`).join('') : "";

    let text = node.type;

    switch (node.type) {
        case Entry.type:
            const entryNode = node as BasicEntryProps;
            classNames.push("tree-item-entry");

            if (entryNode.title) {
                text = entryNode.title[0];
            }
            break;
        case Section.type:
            classNames.push("tree-item-section");
            text = node.value || node.type;
            break;
        default:
            classNames.push(`tree-item-${node.type}`);
            text = node.type;
    }

    return (
        <span className={classNames.join(' ')}>{text}
            <span className="tree-item-selector">{htmlId}{cssClasses}</span>
        </span>
    );
}

interface TreeMapperProps {
    root: Array<ResumeNode> | ResumeNode;
    selectNode: (uuid: string) => void;
    selectedNode?: string;
}

function TreeMapper({ root, selectNode, selectedNode }: TreeMapperProps): JSX.Element {
    let childNodes: Array<ResumeNode> | undefined = undefined;
    
    if (Array.isArray(root)) {
        childNodes = root;
    }
    else if (root.childNodes) {
        childNodes = root.childNodes;
    }

    if (childNodes) {
        return <ul className="node-tree">
            {childNodes.map((node) => {
                const isSelected = selectedNode === node.uuid;
                const className = isSelected ? "tree-item-selected" : "";

                return <li 
                    className={className} 
                    key={node.uuid} 
                    onClick={(event) => {
                        selectNode(node.uuid);
                        event.stopPropagation();
                    }}
                >
                    {represent(node)} 
                    <TreeMapper 
                        root={node} 
                        selectNode={selectNode} 
                        selectedNode={selectedNode} 
                    />
                </li>
            })}
        </ul>
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