import * as React from "react";
import ResumeNodeBase, { AddChild, UpdateChild, Action, ResumeNodeProps } from "./ResumeNodeBase";
import ReactQuill from "react-quill";
import { Menu, Item, MenuProvider } from 'react-contexify';
import AddIcon from "../icons/add-24px.svg";
import 'react-contexify/dist/ReactContexify.min.css';
import Placeholder from "./Placeholder";
import ResumeTextField from "./controls/TextField";

interface ListProps extends ResumeNodeProps {
    isMoving?: boolean;
}

/** Represents an individual item in a list */
export class ListItem<P extends ListProps = ListProps> extends ResumeNodeBase<P> {
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

        const dataValue = this.props.value as string;
        if (dataValue) {
            let htmlCode = dataValue;

            // Strip out parent <p> tags since we don't need them
            if (htmlCode.slice(0, 3) === '<p>' && htmlCode.slice(-4) === '</p>') {
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
                onChange={((this.props.updateData as UpdateChild).bind(this, this.props.id, "value") as (data: any) => void)}
            />
        }

        return <li>
            <span className="iflex-row">
                <span>{value}</span>
            </span>
        </li>
    }
}

/** Represents a list component */
export default class List extends ResumeNodeBase<ListProps> {
    constructor(props) {
        super(props);

        this.addChild = this.addChild.bind(this);
        this.moveBullets = this.moveBullets.bind(this);
    }

    get moveText(): string {
        return this.props.isMoving ? "Done Moving" : "Move Items";
    }

    get hideText(): string {
        return this.props.isHidden ? "Show List" : "Hide List";
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)(
            this.props.id,
                {
                type: 'ListItem'
            });
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
        return <Menu id={this.props.uuid}>
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

        return <ul className={this.className} {...this.selectTriggerProps}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
        </ul>
    }

    /** Returns a "handle" which can be used to select the column itself and not the columns it contains */
    renderGrabHandle() {
        if (this.isHovering && !this.isSelected) {
            return <div className="column-grab-handle-container">
                <div className="column-grab-handle">
                    Click here to select description list
                </div>
            </div>
        }

        return <></>
    }

    render() {
        return <React.Fragment>
            <MenuProvider id={this.props.uuid}>
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
    get className() {
        return super.className + " resume-definition";
    }

    render() {
        let value: any = this.props.value || "";

        const term = <ResumeTextField
            label="Term"
            onChange={this.updateData.bind(this, "term") as (text: string) => void}
            value={this.props.term}
            defaultText="Enter a term"
        />

        /**
        if (this.props.isEditing) {
            value = <InputGroup size="sm">
                <Form.Control value={value}
                    onChange={this.updateDataEvent.bind(this, "value")}
                    placeholder="Value" />
                    </InputGroup>
        }
        **/

        return <div className={this.className} {...this.selectTriggerProps}>
            <dt>
                <span>{term}</span>
            </dt>
            <dd>
                <span className="flex-row">
                    <Placeholder text={value} />
                </span>
            </dd>
        </div>
    }
}

export class DescriptionList extends List {
    renderList() {
        if (this.props.isHidden && this.isPrinting) {
            return <></>
        }

        return <ul className={this.className} {...this.selectTriggerProps}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
        </ul>
    }
}