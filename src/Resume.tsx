import * as React from 'react';
import loadComponent, { EditorMode } from './components/LoadComponent';
import { saveAs } from 'file-saver';
import SplitPane from 'react-split-pane';
import { GlobalHotKeys } from 'react-hotkeys';

import './css/index.css';
import './scss/custom.scss';
import 'react-quill/dist/quill.snow.css';

import { Button, ButtonToolbar, ButtonGroup, InputGroup, Card, Tab, Col, Nav } from 'react-bootstrap';
import { FileLoader } from './components/FileLoader';
import { deleteAt, moveUp, moveDown } from './components/Helpers';
import { Nonprintable } from './components/Nonprintable';
import { Action } from './components/ResumeComponent';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-github";
import { SectionHeaderPosition } from './components/Section';
import ResumeTemplateProvider from './components/ResumeTemplateProvider';

interface PageState {
    children: Array<object>;
    customCss: string;

    /** Set of nodes we are currently hovering over */
    hovering: Set<string>;

    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    /** Unselect the currently selected node */
    unselectNode?: Action;
    activeTemplate?: string;
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

        // Load "Traditional 1" template
        const template = ResumeTemplateProvider.Traditional1();
        this.state = {
            children: template.children,
            customCss: template.customCss,
            hovering: new Set<string>(),
            mode: 'normal',
            sectionTitlePosition: template.sectionTitlePosition
        };

        this.renderStyle();

        this.addSection = this.addSection.bind(this);
        this.addChild = this.addChild.bind(this);
        this.changeTemplate = this.changeTemplate.bind(this);
        this.updateData = this.updateData.bind(this);
        this.loadData = this.loadData.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.renderStyle = this.renderStyle.bind(this);
        this.onStyleChange = this.onStyleChange.bind(this);
        this.saveFile = this.saveFile.bind(this);
        this.unselect = this.unselect.bind(this);
        this.toggleStyleEditor = this.toggleStyleEditor.bind(this);
        this.hoverInsert = this.hoverInsert.bind(this);
        this.hoverOut = this.hoverOut.bind(this);
        this.isSelectBlocked = this.isSelectBlocked.bind(this);
    }

    get isEditingStyle(): boolean {
        return this.state.mode == 'editingStyle';
    }

    get isPrinting(): boolean {
        return this.state.mode == 'printing';
    }

    // Determine if a node shouldn't be allowed to be selected
    isSelectBlocked(id: string) {
        const ids = Array.from(this.state.hovering);
        for (let i in ids) {
            const otherId = ids[i];

            if (otherId.search(id) >= 0 && otherId != id) {
                return true;
            }
        }

        return false;
    }

    hoverInsert(id: string) {
        this.state.hovering.add(id);
    }

    hoverOut(id: string) {
        this.state.hovering.delete(id);
    }

    addSection() {
        this.state.children.push({
            type: 'Section',
            headerPosition: this.state.sectionTitlePosition
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

    changeTemplate() {
        const template = ResumeTemplateProvider.Traditional1();

        this.setState({
            activeTemplate: template.activeTemplate,
            children: template.children,
            customCss: template.customCss,
            sectionTitlePosition: template.sectionTitlePosition,
            mode: 'changingTemplate'
        });
    }

    unselect() {
        if (this.state.unselectNode as Action) {
            (this.state.unselectNode as Action)();
        }

        this.setState({ unselectNode: undefined });
    }

    updateSelected(unselect: Action) {
        this.setState({ unselectNode: unselect });
    }

    toggleStyleEditor() {
        this.setState({ mode: 'editingStyle' });
    }
    
    renderHotkeys() {
        const keyMap = {
            PRINT_MODE: "shift+p"
        };

        const handlers = {
            PRINT_MODE: (event) => {
                if (!this.isPrinting) {
                    this.setState({ mode: 'printing' });
                    return;
                }

                this.setState({ mode: 'normal' });
            }
        };

        return <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
    }

    renderChildren() {
        return this.state.children.map((elem, idx, arr) =>
            <React.Fragment key={idx}>
                {loadComponent(elem, idx, arr.length, {
                    mode: this.state.mode,
                    addChild: this.addChild.bind(this, idx),
                    hoverInsert: this.hoverInsert.bind(this),
                    hoverOut: this.hoverOut.bind(this),
                    isSelectBlocked: this.isSelectBlocked.bind(this),
                    moveUp: this.moveUp.bind(this, idx),
                    moveDown: this.moveDown.bind(this, idx),
                    deleteChild: this.deleteChild.bind(this, idx),
                    toggleEdit: this.toggleEdit.bind(this, idx),
                    updateData: this.updateData.bind(this, idx),
                    unselect: this.unselect,
                    updateSelected: this.updateSelected.bind(this)
                }
                )}
            </React.Fragment>)
    }

    renderToolbar() {
        let unselectProps: object = {
            disabled: true
        };

        if (this.state.unselectNode as Action) {
            unselectProps = {
                onClick: this.unselect
            };
        }

        if (!this.isPrinting) {
            return <ButtonToolbar aria-label="Resume Editor Controls">
                <Button onClick={this.changeTemplate}>New</Button>
                <FileLoader loadData={this.loadData} />

                <ButtonGroup className="mr-2">
                    <Button onClick={this.saveFile}>Save to File</Button>
                </ButtonGroup>

                <ButtonGroup className="mr-2">
                    <Button {...unselectProps}>Unselect</Button>
                    <Button onClick={this.toggleStyleEditor}>Edit Style</Button>
                </ButtonGroup>
            </ButtonToolbar>
        }

        return <></>
    }
    
    renderStyleEditor() {
        if (this.isEditingStyle) {
            return <>
                <AceEditor
                    mode="css"
                    theme="github"
                    onChange={this.onStyleChange}
                    value={this.state.customCss}
                    name="style-editor"
                    editorProps={{ $blockScrolling: true }}
                />

                <ButtonToolbar className="mt-2">
                    <Button onClick={this.renderStyle}>Apply</Button>
                    <Button onClick={(event) => this.setState({ mode: 'normal' })}>Done</Button>
                </ButtonToolbar>
            </>
        }

        return <></>
    }

    renderTemplateChanger() {
        return <>
            <Nav variant="pills"
                activeKey={this.state.activeTemplate}
                className="flex-column">
                <Nav.Item>
                    <Nav.Link eventKey='Traditional 1' onClick={
                        (event) => this.setState(ResumeTemplateProvider.Traditional1())
                    }>Traditional 1</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey='Traditional 2' onClick={
                        (event) => this.setState(ResumeTemplateProvider.Traditional2())
                    }>Traditional 2</Nav.Link>
                </Nav.Item>
            </Nav>
            <Button onClick={(event) => this.setState({ mode: 'normal' })}>Use this Template</Button>
        </>
    }

    render() {
        const resume = <>
            {this.renderToolbar()}
            <div id="resume" style={{
                width: "100%",
                height: "100%",
                overflowY: "auto"
            }}>
            {this.renderChildren()}

            <Nonprintable isPrinting={this.isPrinting}>
                <Button onClick={this.addSection}>Add Section</Button>
            </Nonprintable>
            </div>
        </>

        let mainContent = resume;

        // Split resume and style editor
        if (this.isEditingStyle) {
            mainContent = <SplitPane defaultSize="500px" primary="second">
                <div style={{ height: "100vh" }}>
                    {resume}
                </div>
                {this.renderStyleEditor()}
            </SplitPane>
        }
        else if (this.state.mode == "changingTemplate") {
            mainContent = <div style={{
                display: 'flex',
                flexDirection: 'row'
            }}>
                <div style={{ width: "70%" }}>
                    {resume}
                </div> 
                <div style={{ width: "30%" }}>
                    {this.renderTemplateChanger()}
                </div>
            </div>
        }

        return <React.Fragment>
            {this.renderHotkeys()}
            {mainContent}
        </React.Fragment>
    }
}

export default Resume;