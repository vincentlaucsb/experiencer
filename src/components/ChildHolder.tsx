import * as React from "react";
import IContainer from "./IContainer";
import loadComponent from "./LoadComponent";

export default class ChildHolder {
    children: Array<object>;
    parent: IContainer;

    constructor(parent: IContainer) {
        this.children = new Array<object>();
        this.parent = parent;
    }

    addChild(child: object) {
        this.children.push(child);
        return this;
    }

    deleteChild(key: number) {
        let newChildren = new Array<object>();
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
                    {loadComponent(elem)}
                    <button onClick={this.parent.deleteChild.bind(this.parent, idx)}>Delete</button>
                </React.Fragment>)
            }
        </React.Fragment>
    }
}