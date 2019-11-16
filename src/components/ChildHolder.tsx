import * as React from "react";

export default class ChildHolder {
    children: Array<JSX.Element>;

    constructor(children: Array<JSX.Element> | JSX.Element | undefined) {
        this.children = new Array<JSX.Element>();

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

    render(): JSX.Element {
        return <React.Fragment>
            {this.children.map((elem, idx) => <React.Fragment key={idx}>{elem}</React.Fragment>)}
        </React.Fragment>
    }
}