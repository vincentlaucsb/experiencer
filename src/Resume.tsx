import * as React from 'react';
import loadComponent from './components/LoadComponent';
import { saveAs } from 'file-saver';
import { SideMenu } from './components/SideMenu';

import "./css/index.css"
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from 'react-bootstrap';
import { FileLoader } from './components/FileLoader';
import { deleteAt } from './components/Helpers';

interface PageState {
    children: Array<object>;
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
    },
    {
        type: 'Section',
        title: 'Objective',
        children: [
            {
                type: 'Paragraph',
                value: 'To conquer the world.'
            }
        ]
    },
    {
        type: 'Section',
        title: 'Education',
        children: [
            {
                type: 'Entry'
            }
        ]
    }
    
];

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
            children: resumeData,
            customCss: `body {
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
        this.addChild = this.addChild.bind(this);
        this.updateData = this.updateData.bind(this);
        this.loadData = this.loadData.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.renderStyle = this.renderStyle.bind(this);
        this.onStyleChange = this.onStyleChange.bind(this);
        this.saveFile = this.saveFile.bind(this);
    }

    addSection() {
        this.state.children.push({
            type: 'Section',
            title: 'Add title here'
        });

        this.setState({ children: this.state.children });
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

    addChild(idx: number, node: object) {
        if (!this.state.children[idx]['children']) {
            this.state.children[idx]['children'] = new Array<object>();
        }

        this.state.children[idx]['children'].push(node);

        this.setState({
            children: this.state.children
        });
    }

    deleteChild(idx: number) {
        this.setState({
            children: deleteAt(this.state.children, idx)
        });
    }

    updateData(idx: number, key: string, data: any) {
        this.state.children[idx][key] = data;

        this.setState({
            children: this.state.children
        });
    }

    toggleEdit(idx: number) {
        let currentValue = this.state.children[idx]['isEditing'];
        this.state.children[idx]['isEditing'] = !currentValue;

        this.setState({
            children: this.state.children
        });
    }

    loadData(data: Array<object>) {
        this.setState({ children: data });
    }

    // Save data to an external file
    saveFile() {
        var blob = new Blob([JSON.stringify(this.state.children)],
            {
                type: "text/plain;charset=utf-8"
            }
        );

        // TODO: Allow user to change filename
        saveAs(blob, "resume.json");
    }

    render() {
        return <div style={{
            display: 'flex',
            flexDirection: 'row'
        }}>
            <div id="resume" style={{ width: "100%" }}>
                {this.state.children.map((elem, idx) =>
                    <React.Fragment key={idx}>
                        {loadComponent(elem, {
                            addChild: this.addChild.bind(this, idx),
                            deleteChild: this.deleteChild.bind(this, idx),
                            toggleEdit: this.toggleEdit.bind(this, idx),
                            updateData: this.updateData.bind(this, idx)
                        })}
                    </React.Fragment>)
                }

                <Button onClick={this.addSection}>Add Section</Button>
            </div>

            <div style={{
                maxWidth: "500px",
                paddingLeft: "1em"
            }}>
                <SideMenu>
                    <FileLoader loadData={this.loadData} />
                    <Button onClick={this.saveFile}>
                        Save Data
                    </Button>

                    <h2>Style Editor</h2>
                    <textarea style={{
                        minWidth: "400px",
                        minHeight: "400px",
                        width: "100%"
                    }} onChange={this.onStyleChange} value={this.state.customCss} />
                    <button onClick={this.renderStyle}>Update</button>
                </SideMenu>
            </div>
        </div>
    }
}

export default Resume;