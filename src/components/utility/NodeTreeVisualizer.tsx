import Entry, { BasicEntryProps } from "../Entry";
import React from "react";
import Section from "../Section";
import { arraysEqual } from "../Helpers";
import { IdType, ResumeNode } from "./Types";

export interface NodeTreeVisualizerProps {
    childNodes: Array<ResumeNode>;
    selectNode: (id: IdType) => void;
    selectedNode?: IdType;
}

export default class NodeTreeVisualizer extends React.PureComponent<NodeTreeVisualizerProps> {
    constructor(props) {
        super(props);

        this.treeMapper = this.treeMapper.bind(this);
        this.represent = this.represent.bind(this);
    }

    /**
     * Represent a resume node on the tree
     * @param node
     */
    represent(node: ResumeNode) {
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
    };

    treeMapper(root: Array<ResumeNode> | ResumeNode, id?: IdType) {
        let childNodes: Array<ResumeNode> | undefined = undefined;
        if (Array.isArray(root)) {
            childNodes = root;
        }
        else if (root.childNodes) {
            childNodes = root.childNodes;
        }

        if (childNodes) {
            return <ul className="node-tree">
                {childNodes.map((node, idx) => {
                    let className = "";
                    const newId = id ? [...id, idx] : [idx];
                    if (this.props.selectedNode && arraysEqual(this.props.selectedNode, newId)) {
                        className = "tree-item-selected";
                    }

                    return <li className={className} key={idx} onClick={(event) => {
                        this.props.selectNode(newId);
                        event.stopPropagation();
                    }}>{this.represent(node)} {this.treeMapper(node, newId)}</li>
                })}
            </ul>
        }

        return <></>
    };

    render() {
        return (
            <div>
                {this.treeMapper(this.props.childNodes)}
            </div>
        );
    }
}