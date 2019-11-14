import * as React from 'react';
import Editable, { EditableProps, EditableState } from "./Editable";

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
    title: string;
}

interface SectionState {

}

class Section extends React.Component<SectionProps> {
    constructor(props) {
        super(props);

        this.addChild = this.addChild.bind(this);
    }

    addChild() {

    }

    render() {
        return <section>
            <h2>
                {this.props.title}
                <div style={{ float: "right" }}>
                    <button onClick={this.addChild}>Add</button>
                </div>
            </h2>
                {this.props.children}
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

interface ParagraphState {
    isEditing: boolean;
    value: string;
}

class Paragraph extends Editable<ParagraphProps, EditableState> {
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
    children?: Array<any>;
}

class Resume extends React.Component<{}, PageState> {
    constructor(props) {
        super(props);

        this.state = {
            children: [
                <FlexibleRow>
                    <Title value="Vincent La" />
                    <Paragraph value="Email: vincela9@hotmail.com
                        Phone: 123-456-7890" />
                </FlexibleRow>,
                <Section title="Objective">
                    <Paragraph value="To conquer the world." />
                </Section>
            ]
        };
    }

    render() {
        return <React.Fragment>
            {this.state.children.map((elem, i) => <React.Fragment key={i}>{elem}</React.Fragment>)}
        </React.Fragment>
    }
}

export default Resume;
