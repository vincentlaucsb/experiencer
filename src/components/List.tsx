import * as React from "react";
import ResumeComponent, { AddChild, UpdateChild, Action, ResumeComponentProps } from "./ResumeComponent";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import { Button, ButtonGroup } from "react-bootstrap";
import ReactQuill from "react-quill";

interface ListProps extends ResumeComponentProps {
    isMoving?: boolean;
}

export class ListItem extends ResumeComponent<ListProps> {
    constructor(props) {
        super(props);
    }

    static quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['link'],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    render() {
        let value: any = "";
        let moveButtons: any = "";

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

        if (this.props.isMoving) {
            moveButtons = <React.Fragment>
                <UpButton {...this.props} />
                <DownButton {...this.props} />
            </React.Fragment>
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
                {moveButtons}
            </div>
        </li>
    }
}

export default class List extends ResumeComponent<ListProps> {
    constructor(props) {
        super(props);

        this.addChild = this.addChild.bind(this);
        this.moveBullets = this.moveBullets.bind(this);
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)({
                type: 'ListItem'
            });
        }
    }

    moveBullets() {
        let children = this.props.children as Array<object>;
        let isMoving = this.props.isMoving ? false : true;

        for (let i in children) {
            children[i]['isMoving'] = isMoving;
        }

        // Replace node's children with new list of children that excludes deleted node
        if (this.props.updateData as ((key: string, data: any) => void)) {
            (this.props.updateData as ((key: string, data: any) => void))("isMoving", isMoving);
            (this.props.updateData as ((key: string, data: any) => void))("children", children);
        }
    }

    render() {
        let moveText = this.props.isMoving ? "Done Moving" : "Move Bullets";

        return <ul>
                {this.renderChildren()}
            <li className="list-options">
                <ButtonGroup>
                    <Button onClick={this.addChild} size="sm">Add Bullet</Button>
                    <Button onClick={this.moveBullets} size="sm">{moveText}</Button>
                </ButtonGroup>

                <Button onClick={this.props.deleteChild as Action} size="sm" variant="danger">Delete List</Button>
            </li>
            </ul>
    }
}