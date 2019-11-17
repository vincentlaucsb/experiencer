import Editable, { EditableState, EditableProps, MultiEditable, MultiEditableState } from "./Editable";
import ChildHolder from "./ChildHolder";
import React = require("react");
import IContainer from "./IContainer";

export interface EditableContainerState extends ContainerState, EditableState { }

export interface ContainerState {
    children: ChildHolder;
}

function _addChild<P, S extends ContainerState>(obj: IContainer<P, S>) {
    obj.setState({
        children: obj.state.children.addChild(
            React.cloneElement(obj.defaultChild))
    });
}

function _deleteChild<P, S extends ContainerState>(obj: IContainer<P, S>, idx: number) {
    obj.setState({
        children: obj.state.children.deleteChild(idx)
    });
}

export class Container<
    Props = {},
    State extends ContainerState = EditableContainerState>
    extends React.Component<Props, State>
    implements IContainer {

    defaultChild: JSX.Element;

    constructor(props: Props) {
        super(props);

        this.addChild = this.addChild.bind(this);
        this.deleteChild = this.deleteChild.bind(this);
    }

    addChild() {
        _addChild(this);
    }

    deleteChild(idx: number) { _deleteChild(this, idx); }
}

export class EditableContainer<
    Props extends EditableProps = {},
    State extends EditableContainerState = EditableContainerState>
    extends Editable<Props, State>
    implements IContainer
{

    defaultChild: JSX.Element;

    constructor(props: Props) {
        super(props);

        this.addChild = this.addChild.bind(this);
        this.deleteChild = this.deleteChild.bind(this);
    }

    addChild() {
        _addChild(this);
    }

    deleteChild(idx: number) { _deleteChild(this, idx); }
}

export interface MultiEditableContainerState extends ContainerState, MultiEditableState { }

export class MultiEditableContainer<
    Props = {},
    State extends MultiEditableContainerState = MultiEditableContainerState>
    extends MultiEditable<Props, State>
    implements IContainer {

    defaultChild: JSX.Element;

    constructor(props: Props) {
        super(props);

        this.addChild = this.addChild.bind(this);
        this.deleteChild = this.deleteChild.bind(this);
    }

    addChild() {
        _addChild(this);
    }

    deleteChild(idx: number) { _deleteChild(this, idx); }
}