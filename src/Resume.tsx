import * as React from 'react';
import Editable, { EditableProps, EditableState } from "./components/Editable";
import Entry from './components/Entry';
import ChildHolder from './components/ChildHolder';

interface FlexibleRowProps {
    children?: any;
}

class FlexibleRow extends React.Component<FlexibleRowProps> {
    constructor(props) {
        super(props);
    }

    render() {
        return <div style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            width: "100%"
        }}>
            {this.props.children}
        </div>
    }
}

interface SectionProps {
    children?: any;
    defaultChild?: JSX.Element;
    title: string;
}

interface SectionState {
    children: ChildHolder;
}

class Section extends React.Component<SectionProps, SectionState> {
    constructor(props) {
        super(props);
        this.state = {
            children: new ChildHolder(props.children)
        };
        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        this.setState({
            children: this.state.children.addChild(React.cloneElement(this.props.defaultChild))
        });
    }

    render() {
        let addButton = null;
        if (this.props.defaultChild) {
            addButton = <div style={{ float: "right" }}>
                <button onClick={this.addChild}>Add</button>
            </div>;
        }

        return <section>
            <h2>
                {this.props.title}
                {addButton}
            </h2>
            {this.state.children.render()}
            </section>;
    }
}

interface TitleProps extends EditableProps {
    value: string;
}

interface TitleState extends EditableState {
}

class Title extends Editable<TitleProps, TitleState> {
    constructor(props: TitleProps) {
        super(props);

        this.state = {
            isEditing: false,
            value: props.value
        };
    }

    renderEditing(): JSX.Element {
        return <React.Fragment>
            <input onChange={this.updateValue}
                value={this.state.value} type="text" />
            <button onClick={this.toggleEdit}>Done</button>
        </React.Fragment>;
    }

    renderViewing(): JSX.Element {
        return <h1>
                {this.state.value}
                <div style={{ display: "inline-block" }}>
                <button onClick={this.toggleEdit}>Edit</button>
            </div>
        </h1>;
    }
}

interface ParagraphProps extends EditableProps {
    value?: string;
}

class Paragraph extends Editable<ParagraphProps> {
    constructor(props) {
        super(props);

        this.state = {
            isEditing: false,
            value: props.value ? props.value : ""
        };
    }

    // Convert newlines ('\n') into HTML line breaks
    processTextArea() : JSX.Element {
        let textArea = this.state.value.split("\n");

        return <React.Fragment>
            {textArea.map(x => <React.Fragment>{x}<br /></React.Fragment>)}
            </React.Fragment>;
    }

    renderEditing(): JSX.Element {
        return <React.Fragment>
            <textarea onChange={this.updateValue} value={this.state.value} />
            <button onClick={this.toggleEdit}>Done</button>
        </React.Fragment>;
    }

    renderViewing(): JSX.Element {
        return <p>
            {this.processTextArea()}
            <span style={{ display: "inline-block" }}>
            <button onClick={this.toggleEdit}>Edit</button>
        </span></p>;
    }
}

interface PageState {
    children: ChildHolder;
}

class Resume extends React.Component<{}, PageState> {
    constructor(props) {
        super(props);

        this.state = {
            children: new ChildHolder([
                <FlexibleRow>
                    <Title value="Vincent La" />
                    <Paragraph value="Email: vincela9@hotmail.com
                        Phone: 123-456-7890" />
                </FlexibleRow>,
                <Section title="Objective">
                    <Paragraph value="To conquer the world." />
                </Section>,
                <Section title="Education" defaultChild={<Entry />}>
                    <Entry />
                </Section>
            ])
        };

        this.addSection = this.addSection.bind(this);
    }

    addSection() {
        this.setState({
            children: this.state.children.addChild(<Section title="Add title here" defaultChild={<Entry />} />)
        });
    }

    render() {
        return <React.Fragment>
            {this.state.children.render()}

            <button onClick={this.addSection}>Add Section</button>
        </React.Fragment>
    }
}

export default Resume;
