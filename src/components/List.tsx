import * as React from "react";
import ResumeComponent, { AddChild, UpdateChild, Action, ResumeComponentProps, SelectedComponentProps } from "./ResumeComponent";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import { Button, ButtonGroup } from "react-bootstrap";
import ReactQuill from "react-quill";
import { Nonprintable } from "./Nonprintable";
import { Menu, Item, Separator, Submenu, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';

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

    getEditingMenu() {
        let moveButtons = this.props.isMoving ? <>
            <UpButton {...this.props} />
            <DownButton {...this.props} />
        </> : <></>

        return <span>
            <EditButton {...this.props} />
            <DeleteButton {...this.props} />
            {moveButtons}
        </span>
    }

    render() {
        let value: any = "";

        if (this.props.value) {
            let htmlCode = this.props.value;

            // Strip out parent <p> tags since we don't need them
            if (htmlCode.slice(0, 3) == '<p>' && htmlCode.slice(-4) == '</p>') {
                htmlCode = htmlCode.slice(3, htmlCode.length - 4);
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

        return <li>
            <span className="flex-row">
                <span>{value}</span>
                {this.renderEditingMenu()}
            </span>
        </li>
    }
}

export default class List extends ResumeComponent<ListProps> {
    constructor(props) {
        super(props);

        this.state = {
            isSelected: false
        };

        this.addChild = this.addChild.bind(this);
        this.moveBullets = this.moveBullets.bind(this);
        this.setSelected = this.setSelected.bind(this);
        this.unselect = this.unselect.bind(this);
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)({
                type: 'ListItem'
            });
        }
    }

    getEditingMenu() {
        if (this.state.isSelected) {
            let moveText = this.props.isMoving ? "Done Moving" : "Move Bullets";

            return <li className="list-options">
                <ButtonGroup>
                    <Button onClick={this.addChild} size="sm">Add Bullet</Button>
                    <Button onClick={this.moveBullets} size="sm">{moveText}</Button>
                </ButtonGroup>

                <Button onClick={this.props.deleteChild as Action} size="sm" variant="danger">Delete List</Button>
            </li>
        }
    }

    moveBullets() {
        let children = this.props.children as Array<object>;
        let isMoving = this.props.isMoving ? false : true; // Flip
        children.forEach((node) => {
            node['isMoving'] = isMoving
        });

        // Replace node's children with new list of children that excludes deleted node
        this.updateData("isMoving", isMoving);
        this.updateData("children", children);
    }
    
    render() {
        let className = (this.state.isSelected || this.state.isHovering) ? 'resume-selected' : '';
        let moveText = this.props.isMoving ? "Done Moving" : "Move Bullets";
        let hideText = this.props.isHidden ? "Show List" : "Hide List";

        if (this.props.isHidden) {
            className += ' resume-hidden';
        }

        let list = <ul className={className} {...this.getSelectTriggerProps()}>
            {this.renderChildren()}
            {this.renderEditingMenu()}
        </ul>

        if (this.props.isHidden) {
            if (this.isPrinting) {
                list = <></>
            }
        }

        return <React.Fragment>
            <MenuProvider id={this.props.id}>
                {list}
            </MenuProvider>
            <Menu id={this.props.id}>
                <Item onClick={this.addChild}>Add Bullet</Item>
                <Item onClick={this.moveBullets}>{moveText}</Item>
                <Item onClick={this.toggleHidden}>{hideText}</Item>
                <Item onClick={this.props.deleteChild as Action}>Delete List</Item>
            </Menu>
        </React.Fragment>
    }
}

interface DescriptionItemProps extends ListProps {
    term?: string;
}

export class DescriptionListItem extends ResumeComponent<DescriptionItemProps> {
    constructor(props) {
        super(props);
    }

    getEditingMenu() {
        let moveButtons = this.props.isMoving ? <>
            <UpButton {...this.props} />
            <DownButton {...this.props} />
        </> : <></>

        return <span>
            <EditButton {...this.props} />
            <DeleteButton {...this.props} />
            {moveButtons}
        </span>
    }

    render() {
        let term: any = this.props.term || "";
        let value: any = this.props.value || "";

        if (this.props.isEditing) {
            term = <input onChange={((this.updateDataEvent as (key: string, event: any) => void).bind(this, "term") as (data: any) => void)} value={this.props.term || ""} />
            value = <input onChange={((this.updateDataEvent as (key: string, event: any) => void).bind(this, "value") as (data: any) => void)} value={this.props.value || ""} />
        }

        return <div className="flex-row">
            <dt>
                <span>{term}</span>
            </dt>
            <dd>
                <span className="flex-row">
                    <span>{value}</span>
                    {this.renderEditingMenu()}
                </span>
            </dd>
        </div>
    }
}

export class DescriptionList extends List {
    constructor(props: ListProps) {
        super(props);
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)({
                type: 'DescriptionListItem'
            });
        }
    }

    render() {
        let className = (this.state.isSelected || this.state.isHovering) ? 'resume-selected' : '';
        let moveText = this.props.isMoving ? "Done Moving" : "Move Bullets";
        let hideText = this.props.isHidden ? "Show List" : "Hide List";

        if (this.props.isHidden) {
            className += ' resume-hidden';
        }

        let list = <dl className={className} {...this.getSelectTriggerProps()}>
            {this.renderChildren()}
            {this.renderEditingMenu()}
        </dl>

        if (this.props.isHidden) {
            if (this.isPrinting) {
                list = <></>
            }
        }

        return <React.Fragment>
            <MenuProvider id={this.props.id}>
                {list}
            </MenuProvider>
            <Menu id={this.props.id}>
                <Item onClick={this.addChild}>Add Bullet</Item>
                <Item onClick={this.moveBullets}>{moveText}</Item>
                <Item onClick={this.toggleHidden}>{hideText}</Item>
                <Item onClick={this.props.deleteChild as Action}>Delete List</Item>
            </Menu>
        </React.Fragment>
    }
}