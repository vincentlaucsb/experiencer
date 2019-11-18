import * as React from 'react';
import Entry from './components/Entry';
import ChildHolder from './components/ChildHolder';
import Section from './components/Section';
import Title from './components/Title';
import Paragraph from './components/Paragraph';
import { Container, ContainerState } from './components/Container';

interface PageState extends ContainerState {
    customCss: string;
}

const resumeData = [
    {
        type: 'FlexibleRow',
        children: [
            {
                type: 'Title',
                value: 'Vincent La'
            },
            {
                type: 'Paragraph',
                value: 'Email: vincela9@hotmail.com\nPhone: 123-456-7890'
            }
        ]
    }
];
/*
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
*/

class Resume extends Container<{}, PageState> {
    style: HTMLStyleElement;

    constructor(props) {
        super(props);

        // Custom CSS
        const head = document.getElementsByTagName("head")[0];
        this.style = document.createElement("style");
        this.style.innerHTML = "";
        head.appendChild(this.style);

        this.state = {
            children: new ChildHolder(this),
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

        for (let i in resumeData) {
            this.state.children.addChild(resumeData[i]);
            // this.addChild(resumeData[i]);
        }
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
        console.log(this.state.children);

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
