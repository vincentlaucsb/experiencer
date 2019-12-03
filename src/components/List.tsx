import * as React from "react";
import ResumeComponent, { AddChild, UpdateChild, Action, ResumeComponentProps } from "./ResumeComponent";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import { Button, ButtonGroup, Form, Row, Col, InputGroup, ButtonToolbar } from "react-bootstrap";
import ReactQuill from "react-quill";
import { Menu, Item, Separator, Submenu, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';

interface ListProps extends ResumeComponentProps {
    isMoving?: boolean;
}

/** Represents an individual item in a list */
export class ListItem<P extends ListProps = ListProps> extends ResumeComponent<P> {
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

        return <>
            <EditButton {...this.props} />
            <DeleteButton {...this.props} />
            {moveButtons}
        </>
    }

    render() {
        let value: any = "";

        const dataValue = this.props.value as string;
        if (dataValue) {
            let htmlCode = dataValue;

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
                onChange={((this.props.updateData as UpdateChild).bind(this, "value") as (data: any) => void)}
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

/** Represents a list component */
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

    get moveText(): string {
        return this.props.isMoving ? "Done Moving" : "Move Items";
    }

    get hideText(): string {
        return this.props.isHidden ? "Show List" : "Hide List";
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)({
                type: 'ListItem'
            });
        }
    }

    /** Get editing controls for this list */
    getEditingMenu() {
        if (this.state.isSelected) {
            return <li className="list-options">
                <ButtonToolbar>
                    <ButtonGroup className="mr-2">
                        <Button onClick={this.addChild} size="sm">Add Item</Button>
                        <Button onClick={this.moveBullets} size="sm">{this.moveText}</Button>
                        <Button onClick={this.toggleHidden} size="sm">{this.hideText}</Button>
                    </ButtonGroup>

                    <ButtonGroup className="mr-2">
                        <Button onClick={this.props.deleteChild as Action} size="sm" variant="danger">Delete List</Button>
                    </ButtonGroup>
                </ButtonToolbar>
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

    renderContextMenu() {
        return <Menu id={this.props.id}>
            <Item onClick={this.addChild}>Add Bullet</Item>
            <Item onClick={this.moveBullets}>{this.moveText}</Item>
            <Item onClick={this.toggleHidden}>{this.hideText}</Item>
            <Item onClick={this.props.deleteChild as Action}>Delete List</Item>
        </Menu>
    }

    renderList() {
        if (this.props.isHidden && this.isPrinting) {
            return <></>
        }

        return <ul className={this.className} {...this.getSelectTriggerProps()}>
            {this.renderChildren()}
            {this.renderEditingMenu()}
        </ul>
    }
    
    render() {
        return <React.Fragment>
            <MenuProvider id={this.props.id}>
                {this.renderList()}
            </MenuProvider>
            {this.renderContextMenu()}
        </React.Fragment>
    }
}

interface DescriptionItemProps extends ListProps {
    term?: string;
}

export class DescriptionListItem extends ListItem<DescriptionItemProps> {
    constructor(props) {
        super(props);
    }

    render() {
        let term: any = this.props.term || "";
        let value: any = this.props.value || "";

        if (this.props.isEditing) {
            term = <InputGroup size="sm">
                <Form.Control value={term}
                    onChange={this.updateDataEvent.bind(this, "term")}
                            placeholder="Term" />
                    </InputGroup>
            value = <InputGroup size="sm">
                <Form.Control value={value}
                    onChange={this.updateDataEvent.bind(this, "value")}
                    placeholder="Value" />
                    </InputGroup>
        }

        return <div className="flex-row">
            <dt>
                <span>{term}</span>
            </dt>
            <dd>
                <span className="flex-row">
                    {value}
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

    renderList() {
        return <dl className={this.className} {...this.getSelectTriggerProps()}>
            {this.renderChildren()}
            {this.renderEditingMenu()}
        </dl>
    }
}