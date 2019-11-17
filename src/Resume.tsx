import * as React from 'react';
import Editable, { EditableProps, EditableState } from "./components/Editable";
import Entry from './components/Entry';
import ChildHolder from './components/ChildHolder';
import EditButton from './components/EditButton';
import Section from './components/Section';
import Title from './components/Title';
import Paragraph from './components/Paragraph';

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

interface PageState {
    children: ChildHolder;
    customCss: string;
}

class Resume extends React.Component<{}, PageState> {
    style: HTMLStyleElement;

    constructor(props) {
        super(props);

        // Custom CSS
        const head = document.getElementsByTagName("head")[0];
        this.style = document.createElement("style");
        this.style.innerHTML = "";
        head.appendChild(this.style);

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
            ]),
            customCss: `body {
    width: 70vw;
    margin: 1em auto 1em auto;
    font-family: Tahoma, sans-serif;
    font-size: 10pt;
}

body * {
    margin: 0;
}

h1, h2, h3, h4 {
    font-family: Georgia, serif;
}

h2 { border-bottom: 1px solid; }

section {
    margin-bottom: 1.5em;
}`
        };

        this.renderStyle();

        this.addSection = this.addSection.bind(this);
        this.renderStyle = this.renderStyle.bind(this);
        this.onStyleChange = this.onStyleChange.bind(this);
    }

    addSection() {
        this.setState({
            children: this.state.children.addChild(<Section title="Add title here" />)
        });
    }

    // Update custom CSS
    onStyleChange(event) {
        this.setState({
            customCss: event.target.value,
        });
    }

    // Push style changes to browser
    renderStyle() {
        this.style.innerHTML = this.state.customCss;
    }

    render() {
        return <React.Fragment>
            {this.state.children.render()}

            <button style={{}} onClick={this.addSection}>Add Section</button>

            <div>
                <h2>Style Editor</h2>
                <textarea onChange={this.onStyleChange} value={this.state.customCss} />
                <button onClick={this.renderStyle}>Update</button>
            </div>
        </React.Fragment>
    }
}

export default Resume;
