import * as React from 'react';
import loadComponent from './components/LoadComponent';
import { saveAs } from 'file-saver';
import { HotKeys } from "react-hotkeys";
import { SideMenu } from './components/SideMenu';
import { GlobalHotKeys } from 'react-hotkeys';

import './css/index.css';
import './scss/custom.scss';
import 'react-quill/dist/quill.snow.css';

import { Button } from 'react-bootstrap';
import { FileLoader } from './components/FileLoader';
import { deleteAt, moveUp, moveDown } from './components/Helpers';
import { Nonprintable } from './components/Nonprintable';
import { SelectedComponentProps, Action } from './components/ResumeComponent';

interface PageState {
    children: Array<object>;
    customCss: string;
    isPrinting: boolean;
    selectedNode?: SelectedComponentProps;
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
}`,
            isPrinting: false
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
        this.unselect = this.unselect.bind(this);
    }

    addSection() {
        this.state.children.push({
            type: 'Section',
            title: 'Add title here'
        });

        this.setState({ children: this.state.children });
    }

    // Move the child at idx up one position
    moveUp(idx: number) {
        this.setState({
            children: moveUp(this.state.children, idx)
        });
    }

    // Move the child at idx down one position
    moveDown(idx: number) {
        this.setState({
            children: moveDown(this.state.children, idx)
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

    loadData(data: object) {
        this.setState({
            children: data['children'] as Array<object>,
            customCss: data['css'] as string
        });
    }

    // Save data to an external file
    saveFile() {
        const data = {
            children: this.state.children,
            css: this.state.customCss
        };

        var blob = new Blob([JSON.stringify(data)],
            {
                type: "text/plain;charset=utf-8"
            }
        );

        // TODO: Allow user to change filename
        saveAs(blob, "resume.json");
    }

    unselect() {
        const prevNode = this.state.selectedNode as SelectedComponentProps;
        if (prevNode) {
            (prevNode.unselect as Action)();
        }
    }

    updateSelected(data: SelectedComponentProps) {
        this.setState({
            selectedNode: data
        });
    }

    render() {
        const keyMap = {
            PRINT_MODE: "shift+p"
        };

        const handlers = {
            PRINT_MODE: (event) => {
                this.setState({ isPrinting: !this.state.isPrinting });
            }
        };

        return <div style={{
            display: 'flex',
            flexDirection: 'row'
        }}>        
            <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
            
            <div id="resume" style={{ width: "100%" }}>
                {this.state.children.map((elem, idx, arr) =>
                    <React.Fragment key={idx}>
                        {loadComponent(elem, idx, arr.length, {
                                addChild: this.addChild.bind(this, idx),
                                moveUp: this.moveUp.bind(this, idx),
                                moveDown: this.moveDown.bind(this, idx),
                                deleteChild: this.deleteChild.bind(this, idx),
                                toggleEdit: this.toggleEdit.bind(this, idx),
                                updateData: this.updateData.bind(this, idx),
                                isPrinting: this.state.isPrinting,
                                unselect: this.unselect,
                                updateSelected: this.updateSelected.bind(this)
                            }
                        )}
                    </React.Fragment>)
                }

                <Nonprintable isPrinting={this.state.isPrinting}>
                    <Button onClick={this.addSection}>Add Section</Button>
                </Nonprintable>
            </div>

            <Nonprintable isPrinting={this.state.isPrinting}>
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
            </Nonprintable>
        </div>
    }
}

export default Resume;