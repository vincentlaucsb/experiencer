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
            case RichText.type:
                if (node.value) {
                    return <span className="tree-item-rich-text">
                        {node.value.slice(0, 20)}
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

    treeMapper(root: ResumeNode, id: IdType) {
        console.log("Mapping");
        if (root.children) {
            return <ul className="node-tree">
                {root.children.map((node, idx) => {
                    const newId = [...id, idx];
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
                <ul className="node-tree">
                    {this.props.childNodes.map((value, idx) => {
                        const id = [idx];
                        return <li key={idx} onClick={(event) => {
                            this.props.selectNode(id);
                            event.stopPropagation();
                        }}>{this.represent(value)} {this.treeMapper(value, id)}</li>;
                    })}
                </ul>
            </div>
        );
    }
}