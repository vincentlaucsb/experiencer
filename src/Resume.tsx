import * as React from 'react';
import loadComponent from './components/LoadComponent';
import { saveAs } from 'file-saver';
import SplitPane from 'react-split-pane';
import { GlobalHotKeys } from 'react-hotkeys';

import './css/index.css';
import './scss/custom.scss';
import 'react-quill/dist/quill.snow.css';

import { Button, ButtonToolbar, ButtonGroup, InputGroup } from 'react-bootstrap';
import { FileLoader } from './components/FileLoader';
import { deleteAt, moveUp, moveDown } from './components/Helpers';
import { Nonprintable } from './components/Nonprintable';
import { SelectedComponentProps, Action } from './components/ResumeComponent';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

const resumeData = [
    {
        type: 'FlexibleRow',
        children: [
            {
                type: 'Title',
                value: 'Your Name Here'
            },
            {
                type: 'Paragraph',
                value: '<p>Email: vincela9@hotmail.com</p><p>Phone: 123-456-7890</p>'
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

const defaultCss = `body {
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
}`;

interface PageState {
    children: Array<object>;
    customCss: string;
    isPrinting: boolean;
    isEditingStyle: boolean;
    selectedNode?: SelectedComponentProps;
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
            children: resumeData,
            customCss: defaultCss,
            isEditingStyle: false,
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
        this.toggleStyleEditor = this.toggleStyleEditor.bind(this);
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
    onStyleChange(css: string) {
        this.setState({
            customCss: css,
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

        // Actually load custom CSS
        this.renderStyle();
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
        if (prevNode && prevNode.unselect as Action) {
            (prevNode.unselect as Action)();
        }
    }

    updateSelected(data: SelectedComponentProps) {
        this.setState({
            selectedNode: data
        });
    }

    toggleStyleEditor() {
        this.setState({
            isEditingStyle: !this.state.isEditingStyle
        });
    }

    renderHotkeys() {
        const keyMap = {
            PRINT_MODE: "shift+p"
        };

        const handlers = {
            PRINT_MODE: (event) => {
                this.setState({ isPrinting: !this.state.isPrinting });
            }
        };

        return <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
    }

    renderChildren() {
        return this.state.children.map((elem, idx, arr) =>
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

    renderToolbar() {
        if (!this.state.isPrinting) {
            return <ButtonToolbar aria-label="Resume Editor Controls">
                <FileLoader loadData={this.loadData} />

                <ButtonGroup>
                    <Button onClick={this.saveFile}>Save to File</Button>
                </ButtonGroup>

                <ButtonGroup>
                    <Button onClick={this.toggleStyleEditor}>Edit Style</Button>
                </ButtonGroup>
            </ButtonToolbar>
        }

        return <></>
    }

    onStyleEditorChange(event) {
        console.log(event);
    }

    renderStyleEditor() {
        if (this.state.isEditingStyle && !this.state.isPrinting) {
            return <div>
                <h2>Style Editor</h2>
                <AceEditor
                    mode="java"
                    theme="github"
                    onChange={this.onStyleChange}
                    value={this.state.customCss}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{ $blockScrolling: true }}
                />
                <button onClick={this.renderStyle}>Update</button>
            </div>
        }

        return <></>
    }

    render() {
        const resume = <div id="resume" style={{ width: "100%" }}>
            {this.renderChildren()}

            <Nonprintable isPrinting={this.state.isPrinting}>
                <Button onClick={this.addSection}>Add Section</Button>
            </Nonprintable>
        </div>

        let mainContent = resume;

        // Split resume and style editor
        if (this.state.isEditingStyle && !this.state.isPrinting) {
            mainContent = <SplitPane defaultSize="500px" primary="second">
                {resume}
                {this.renderStyleEditor()}
            </SplitPane>
        }

        return <React.Fragment>
            {this.renderToolbar()}
            {this.renderHotkeys()}
            {mainContent}
        </React.Fragment>
    }
}

export default Resume;