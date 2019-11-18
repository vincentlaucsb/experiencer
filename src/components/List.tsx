import * as React from "react";
import ChildHolder from "./ChildHolder";
import Editable from "./Editable";

export class ListItem extends Editable {
    constructor(props) {
        super(props);

        this.state = {
            isEditing: false,
            value: ""
        };
    }

    render() {
        if (this.state.isEditing) {
            return <React.Fragment>
                <input onChange={this.updateValue} value={this.state.value} type="text" />
                <div style={{ float: "right" }}><button onClick={this.toggleEdit}>Done</button></div>
            </React.Fragment>
        }

        return <li>
            {this.state.value}
            <div style={{ float: "right" }}><button onClick={this.toggleEdit}>Edit</button></div>
        </li>
    }
}

interface ListProps {
    children?: any;
}

interface ListState {
    children: ChildHolder;
}

export default class List extends React.Component<ListProps, ListState> {
    constructor(props) {
        super(props);

        this.state = {
            children: new ChildHolder(props.children)
        };

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        this.setState({
            children: this.state.children.addChild({
                type: 'ListItem'
            })
        });
    }

    render() {
        return <React.Fragment>
            <div style={{ float: "right" }}>
                <button onClick={this.addChild}>Add</button>
            </div>
            <ul>
            {this.state.children.render()}
            </ul>
            </React.Fragment>
    }
}