import * as React from "react";
import ResumeComponent, { AddChild, UpdateChild, Action } from "./ResumeComponent";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import { Button, ButtonGroup } from "react-bootstrap";
import ReactQuill from "react-quill";

export class ListItem extends ResumeComponent {
    constructor(props) {
        super(props);
    }

    static quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    render() {
        let value: any = "";

        if (this.props.value) {
            let htmlCode = this.props.value;

            // Strip out parent <p> tags since we don't need them
            if (htmlCode.slice(0, 3) == '<p>' && htmlCode.slice(-4) == '</p>') {
                htmlCode = htmlCode.slice(3, htmlCode.length - (3 + 4));
            }
            
            value = <span
                dangerouslySetInnerHTML={{ __html: htmlCode }}
            />
        }

        if (this.props.isEditing) {
            value = <ReactQuill
                modules={ListItem.quillModules}
                value={this.props.value || ""}
                onChange={((this.props.updateData as (key: string, data: any) => void).bind(this, "value") as (data: any) => void)}
            />
        }

        return <li style={{ minHeight: "24px" }}>
            {value}

            <div style={{ float: "right" }}>
                <EditButton {...this.props} />
                <DeleteButton {...this.props} />
                <UpButton {...this.props} />
                <DownButton {...this.props} />
            </div>
        </li>
    }
}

export default class List extends ResumeComponent {
    constructor(props) {
        super(props);

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)({
                type: 'ListItem'
            });
        }
    }

    render() {
        return <ul>
                {this.renderChildren()}
            <li className="list-options">
                <Button onClick={this.addChild} size="sm">Add Bullet</Button>
                <Button onClick={this.props.deleteChild as Action} size="sm" variant="danger">Delete List</Button>
            </li>
            </ul>
    }
}