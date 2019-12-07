import * as React from 'react';
import { saveAs } from 'file-saver';
import SplitPane from 'react-split-pane';
import { GlobalHotKeys } from 'react-hotkeys';
import uuid from 'uuid/v4';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-github";

import './css/index.css';
import './scss/custom.scss';
import 'react-quill/dist/quill.snow.css';

import loadComponent, { EditorMode } from './components/LoadComponent';
import { Button, ButtonToolbar, ButtonGroup, Nav, Navbar, ButtonProps } from 'react-bootstrap';
import FileLoader from './components/controls/FileLoader';
import { deleteAt, moveUp, moveDown, assignIds, deepCopy } from './components/Helpers';
import { Nonprintable } from './components/Nonprintable';
import { SelectedNodeProps, AddChild } from './components/ResumeComponent';
import { SectionHeaderPosition } from './components/Section';
import ResumeTemplateProvider from './components/ResumeTemplateProvider';
import FileSaver from './components/controls/FileSaver';

interface PageState {
    children: Array<object>;
    clipboard?: object;
    customCss: string;

    /** Set of nodes we are currently hovering over */
    hovering: Set<string>;

    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    /** Unselect the currently selected node */
    selectedNode?: SelectedNodeProps;
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
        
        this.state = {
            children: [],
            customCss: "",
            hovering: new Set<string>(),
            mode: "landing",
            sectionTitlePosition: "top"
        };

        this.renderStyle();

        this.changeTemplate = this.changeTemplate.bind(this);
        this.renderStyle = this.renderStyle.bind(this);
        this.onStyleChange = this.onStyleChange.bind(this);
        this.toggleStyleEditor = this.toggleStyleEditor.bind(this);

        /** Resume Nodes */
        this.addColumn = this.addColumn.bind(this);
        this.addSection = this.addSection.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.childMapper = this.childMapper.bind(this);
        this.updateData = this.updateData.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);

        /** Load & Save */
        this.loadData = this.loadData.bind(this);
        this.saveFile = this.saveFile.bind(this);

        /** Cut & Paste */
        this.copyClipboard = this.copyClipboard.bind(this);
        this.pasteClipboard = this.pasteClipboard.bind(this);

        /** Selection Methods */
        this.unselect = this.unselect.bind(this);
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
        this.addChild({
            type: 'Section',
            headerPosition: this.state.sectionTitlePosition
        });
    }

    addColumn() {
        this.addChild({
            type: 'FlexibleRow',
            children: [
                {
                    type: 'FlexibleColumn'
                }
            ]
        });
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

    /**
     * Add an immediate child
     * @param node Node to be added
     */
    addChild(node: object) {
        this.state.children.push(node);
        this.setState({ children: this.state.children });
    }

    /**
     * Add a child for some child node of this resume
     * @param idx  Index of the child
     * @param node Grandchild to be added
     */
    addNestedChild(idx: number, node: object) {
        let children = this.state.children[idx]['children'];
        if (!children) {
            children = new Array<object>();
        }

        // Generate UUID
        node['uuid'] = uuid();

        children.push(node);
        this.setState({ children: this.state.children });
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
            children: assignIds(data['children'] as Array<object>),
            customCss: data['css'] as string,
            mode: 'normal'
        });

        // Actually load custom CSS
        this.renderStyle();
    }

    // Save data to an external file
    saveFile(filename: string) {
        const data = {
            children: this.state.children,
            css: this.state.customCss
        };

        var blob = new Blob([JSON.stringify(data)],
            {
                type: "text/plain;charset=utf-8"
            }
        );

        saveAs(blob, filename);
    }

    changeTemplate() {
        const template = ResumeTemplateProvider.templates['Traditional 1']();

        this.setState({
            activeTemplate: template.activeTemplate,
            children: template.children,
            customCss: template.customCss,
            sectionTitlePosition: template.sectionTitlePosition,
            mode: 'changingTemplate'
        });

        // this.renderStyle();

        this.style.innerHTML = template.customCss;
    }

    /** Copy the currently selected node */
    copyClipboard() {
        if (this.state.selectedNode) {
            const data = this.state.selectedNode.getData();
            this.setState({
                clipboard: data
            });
        }
    }

    /** Paste whatever is currently in the clipboard */
    pasteClipboard() {
        if (this.state.selectedNode) {
            if (this.state.selectedNode.addChild) {
                let node = deepCopy(this.state.clipboard);

                // Generate fresh IDs
                node['uuid'] = uuid();
                if (node['children']) {
                    node['children'] = assignIds(node['children']);
                }

                // Paste
                (this.state.selectedNode.addChild as AddChild)(node);
            }
        }
    }

    unselect() {
        if (this.state.selectedNode) {
            this.state.selectedNode.unselect();
        }

        this.setState({ selectedNode: undefined });
    }

    updateSelected(data?: SelectedNodeProps) {
        this.setState({ selectedNode: data });
    }

    toggleStyleEditor() {
        if (this.isEditingStyle) {
            this.setState({ mode: 'normal' });
            return;
        }

        this.setState({ mode: 'editingStyle' });
    }
    
    renderHotkeys() {
        const keyMap = {
            COPY_SELECTED: "shift+c",
            PASTE_SELECTED: "shift+v",
            DELETE_SELECTED: "shift+del",
            ESCAPE: "esc",
            PRINT_MODE: "shift+p"
        };

        const handlers = {
            COPY_SELECTED: (event) => {
                this.copyClipboard();
            },

            PASTE_SELECTED: (event) => {
                this.pasteClipboard();
            },

            ESCAPE: (event) => {
                // Return everything back to default settings
                this.unselect();
                this.setState({ mode: 'normal' });
            },

            DELETE_SELECTED: (event) => {
                if (this.state.selectedNode) {
                    this.state.selectedNode.deleteChild();
                }
            },

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

    childMapper(elem: object, idx: number, arr: object[]) {
        const uniqueId = elem['uuid'];

        return <React.Fragment key={uniqueId}>
            {loadComponent(elem, idx, arr.length, {
                uuid: uniqueId,
                mode: this.state.mode,
                addChild: this.addNestedChild.bind(this, idx),
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
        </React.Fragment>
    }

    renderChildren() {
        return this.state.children.map(this.childMapper);
    }

    renderToolbar() {
        const haveNode = this.state.selectedNode != undefined;

        /**
         * Conditionally render buttons
         * @param enabled Whether or not button should be enabled
         * @param onClick Click action if button is enabled
         */
        const baseProps = (enabled: boolean, onClick: any) => {
            let props = {
                disabled: !enabled,
                variant: "outline-light" as ButtonProps["variant"]
            };

            if (enabled) {
                props['onClick'] = onClick;
            }

            return props;
        };

        const copyProps = baseProps(haveNode, this.copyClipboard);
        const pasteProps = baseProps(haveNode && this.state.clipboard != undefined, this.pasteClipboard);
        const unselectProps = baseProps(haveNode, this.unselect);

        // Highlight "Edit Style" button conditionally
        const editStyleProps = {
            onClick: this.toggleStyleEditor,
            variant: this.isEditingStyle ? "light" : "outline-light" as ButtonProps["variant"]
        };

        if (!this.isPrinting) {
            return <Navbar bg="dark" variant="dark" sticky="top">
                <Navbar.Brand>
                    Experiencer
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link onClick={this.changeTemplate}>New</Nav.Link>
                    <FileLoader loadData={this.loadData} />
                    <FileSaver saveFile={this.saveFile} />
                </Nav>

                <ButtonGroup className="mr-2">
                    <Button {...copyProps}>Copy</Button>
                    <Button {...pasteProps}>Paste</Button>
                    <Button {...unselectProps}>Unselect</Button>
                </ButtonGroup>
                <ButtonGroup className="mr-2">
                    <Button {...editStyleProps}>Edit Style</Button>
                </ButtonGroup>
            </Navbar>
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
        let templateNames = Object.keys(ResumeTemplateProvider.templates);
        let navItems = templateNames.map((key: string) => <Nav.Item>
                <Nav.Link eventKey={key} onClick={
                    (event) => {
                        this.setState(ResumeTemplateProvider.templates[key]);

                        // Update loaded CSS
                        this.renderStyle();
                    }
                }>{key}</Nav.Link>
            </Nav.Item>);


        return <div className="ml-2 mr-2 mt-2 mb-2" style={{ maxWidth: "300px", width: "30%" }}>
            <Nav variant="pills"
                activeKey={this.state.activeTemplate}
                className="flex-column mb-2">
                {navItems}
            </Nav>
            <Button onClick={(event) => this.setState({ mode: 'normal' })}>Use this Template</Button>
        </div>
    }

    get resumeClassName() {
        if (this.isPrinting) {
            return "resume-printing";
        }

        let classNames = ["ml-auto", "mr-auto", "mt-2"];
        return classNames.join(' ');
    }

    render() {
        const resume = <>
            <div id="resume" className={this.resumeClassName}>
                {this.renderChildren()}

                <Nonprintable isPrinting={this.isPrinting}>
                    <Button onClick={this.addSection}>Add Section</Button>
                    <Button onClick={this.addColumn}>Add Columns</Button>
                </Nonprintable>
            </div>
        </>

        let mainContent = <>
            {this.renderToolbar()}
            {resume}
        </>;

        if (this.state.mode == "landing") {
            mainContent = <>
                {this.renderToolbar()}
                <div id="resume" className={this.resumeClassName}>
                    <h2>Getting Started</h2>
                    <p>Welcome to Experiencer, a powerful tool that can help you create attractive resumes.</p>

                    <h3>Creating a Resume</h3>
                    <ul>
                        <li>Creating a resume</li>
                        <li>
                            <ul>
                                <li>Test</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </>
        }
        else if (this.isEditingStyle) {
            // Split resume and style editor
            mainContent = <SplitPane split="horizontal"
                pane1Style={{ display: "block", height: "auto" }}
                resizerStyle={{ display: "none" }}>
                {this.renderToolbar()}
                <SplitPane split="vertical" defaultSize="500px" primary="second"
                    style={{ height: "100%" }}
                    pane1Style={{ height: "100%", overflowY: "auto"}}>
                    {resume}
                    {this.renderStyleEditor()}
                </SplitPane>
            </SplitPane>
        }
        else if (this.state.mode == "changingTemplate") {
            mainContent = <>
                {this.renderToolbar()}
                <div className="d-flex flex-row">
                    {resume}
                    {this.renderTemplateChanger()}
                </div>
            </>
        }

        return <React.Fragment>
            {this.renderHotkeys()}
            {mainContent}
        </React.Fragment>
    }
}

export default Resume;