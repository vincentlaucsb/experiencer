import * as React from "react";
import IContainer from "./IContainer";

export default class ChildHolder {
    children: Array<React.ReactNode>;
    parent: IContainer;

    constructor(
        parent: IContainer,
        children: Array<React.ReactNode> | React.ReactNode | null = null) {
        this.children = new Array<JSX.Element>();
        this.parent = parent;

        if (children == null) {
            children = parent.props.children;
        }
        
        if (Array.isArray(children)) {
            this.children = children;
        } else if (this.children) {
            this.children = [ children ];
        }
        
    }

    addChild(child: JSX.Element) {
        this.children.push(child);
        return this;
    }

    deleteChild(key: number) {
        console.log("BALEETING");
        let newChildren = new Array<React.ReactNode>();
        for (let i = 0; i < this.children.length; i++) {
            if (i != key) {
                newChildren.push(this.children[i]);
            } else {
                console.log("Deleting ", i);
            }
        }

        this.children = newChildren;
        return this;
    }

    render(): JSX.Element {
        return <React.Fragment>
            {this.children.map((elem, idx) =>
                <React.Fragment key={idx}>
                    {elem}
                    <button onClick={this.parent.deleteChild.bind(this.parent, idx)}>Delete</button>
                </React.Fragment>)
            }
        </React.Fragment>
    }
}