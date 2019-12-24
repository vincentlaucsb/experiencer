import { ResumeNode } from "./NodeTree";
import Entry, { BasicEntryProps } from "../Entry";
import React from "react";
import Section, { BasicSectionProps } from "../Section";
import RichText from "../RichText";
import { IdType } from "./HoverTracker";

export interface NodeTreeVisualizerProps {
    childNodes: Array<ResumeNode>;
    selectNode: (id: IdType) => void;
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
        switch (node.type) {
            case Entry.type:
                const entryNode = node as BasicEntryProps;
                if (entryNode.title) {
                    return <span className="tree-item-entry">
                        {entryNode.title[0]}
                    </span>
                }

                return node.type;
            case Section.type:
                const sectionNode = node as BasicSectionProps;
                return <span className="tree-item-section">{sectionNode.title}</span>
            default:
                return <span className={`tree-item-${node.type}`}>{node.type}</span>;
        }
    };

    treeMapper(root: Array<ResumeNode> | ResumeNode, id?: IdType) {
        let childNodes: Array<ResumeNode> | undefined = undefined;
        if (Array.isArray(root)) {
            childNodes = root;
        }
        else if (root.children) {
            childNodes = root.children;
        }

        if (childNodes) {
            return <ul className="node-tree">
                {childNodes.map((node, idx) => {
                    const newId = id ? [...id, idx] : [idx];
                    return <li key={idx} onClick={(event) => {
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