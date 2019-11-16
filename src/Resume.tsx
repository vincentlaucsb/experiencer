import * as React from 'react';
import Editable, { EditableProps, EditableState } from "./components/Editable";
import Entry from './components/Entry';
import ChildHolder from './components/ChildHolder';
import EditButton from './components/EditButton';
import Section from './components/Section';
import Title from './components/Title';

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
            {textArea.map((x, idx) => <React.Fragment key={idx}>{x}<br /></React.Fragment>)}
            </React.Fragment>;
    }

    render(): JSX.Element {
        if (this.state.isEditing) {
            return <React.Fragment>
                <textarea onChange={this.updateValue} value={this.state.value} />
                <EditButton parent={this} />
            </React.Fragment>;
        }

        return <p>
            {this.processTextArea()}
            <span style={{ display: "inline-block" }}>
                <EditButton parent={this} />
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
                <Section title="Education">
                    <Entry />
                </Section>
            ])
        };

        this.addSection = this.addSection.bind(this);
    }

    addSection() {
        this.setState({
            children: this.state.children.addChild(<Section title="Add title here" />)
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
