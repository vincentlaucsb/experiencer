import * as React from 'react';
import { saveAs } from 'file-saver';
import uuid from 'uuid/v4';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-github";

import './css/index.css';
import './scss/custom.scss';
import 'react-quill/dist/quill.snow.css';

import loadComponent, { EditorMode } from './components/LoadComponent';
import { Button, ButtonToolbar, ButtonGroup, Nav, Navbar, ButtonProps } from 'react-bootstrap';
import { deleteAt, moveUp, moveDown, assignIds, deepCopy } from './components/Helpers';
import { SelectedNodeProps, AddChild } from './components/ResumeComponent';
import ResumeTemplateProvider from './components/ResumeTemplateProvider';
import { ResizableSidebarLayout, StaticSidebarLayout, DefaultLayout } from './components/controls/Layouts';
import Landing from './components/help/Landing';
import { TopNavBar } from './components/controls/TopNavBar';
import ResumeHotKeys from './components/controls/ResumeHotkeys';
import ResumeState from './components/controls/ResumeState';

class Resume extends React.Component<{}, ResumeState> {
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

        this.toggleMode = this.toggleMode.bind(this);

        /** Resume Nodes */
        this.addColumn = this.addColumn.bind(this);
        this.addSection = this.addSection.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.childMapper = this.childMapper.bind(this);
        this.updateData = this.updateData.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);

        /** Templates and Styling **/
        this.changeTemplate = this.changeTemplate.bind(this);
        this.renderStyle = this.renderStyle.bind(this);

        /** Load & Save */
        this.loadData = this.loadData.bind(this);
        this.saveFile = this.saveFile.bind(this);

        /** Cut & Paste */
        this.copyClipboard = this.copyClipboard.bind(this);
        this.pasteClipboard = this.pasteClipboard.bind(this);

        /** Selection Methods */
        this.unselect = this.unselect.bind(this);
        this.isSelectBlocked = this.isSelectBlocked.bind(this);
        this.reset = this.reset.bind(this);
    }

    get isNodeSelected() : boolean {
        return this.state.selectedNode != undefined;
    }

    get isPrinting(): boolean {
        return this.state.mode == 'printing';
    }

    /** Determine if a node shouldn't be allowed to be selected */
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
                { type: 'FlexibleColumn' },
                { type: 'FlexibleColumn' }
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

    // Push style changes to browser
    renderStyle() {
        this.style.innerHTML = this.state.customCss;
    }

    /**
     * Add an immediate child
     * @param node Node to be added
     */
    addChild(node: object) {
        // Generate UUIDs
        node['uuid'] = uuid();
        if (node['children']) {
            node['children'] = assignIds(node['children']);
        }

        this.state.children.push(node);
        this.setState({ children: this.state.children });
    }

    /**
     * Add a child for some child node of this resume
     * @param idx  Index of the child
     * @param node Grandchild to be added
     */
    addNestedChild(idx: number, node: object) {
        if (!this.state.children[idx]['children']) {
            this.state.children[idx]['children'] = new Array<object>();
        }

        let children = this.state.children[idx]['children'];

        // Generate UUIDs
        node['uuid'] = uuid();
        if (node['children']) {
            node['children'] = assignIds(node['children']);
        }

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
            children: assignIds(data['chaildren'] as Array<object>),
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

    /**
     * Render the nodes of this resume
     * @param elem An object with resume component data
     * @param idx  Index of the object
     * @param arr  Array of component data
     */
    childMapper(elem: object, idx: number, arr: object[]) {
        const uniqueId = elem['uuid'];

        // Add an ID to the set of nodes we are hovering over
        const hoverInsert = (id: string) => {
            this.state.hovering.add(id);
        }

        // Remove an ID from the set of nodes we are hovering over
        const hoverOut = (id: string) => {
            this.state.hovering.delete(id);
        }

        return <React.Fragment key={uniqueId}>
            {loadComponent(elem, idx, arr.length, {
                uuid: uniqueId,
                mode: this.state.mode,
                addChild: this.addNestedChild.bind(this, idx),
                hoverInsert: hoverInsert.bind(this),
                hoverOut: hoverOut.bind(this),
                isSelectBlocked: this.isSelectBlocked.bind(this),
                moveUp: this.moveUp.bind(this, idx),
                moveDown: this.moveDown.bind(this, idx),
                deleteChild: this.deleteChild.bind(this, idx),
                toggleEdit: this.toggleEdit.bind(this, idx),
                updateData: this.updateData.bind(this, idx),
                unselect: this.unselect,
                updateSelected: this.updateSelected.bind(this)
            })}
        </React.Fragment>
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
        if (this.state.selectedNode && this.state.selectedNode.addChild) {
            let node = deepCopy(this.state.clipboard);
            (this.state.selectedNode.addChild as AddChild)(node);
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

    /**
     * Switch into mode if not already. Otherwise, return to normal.
     * @param mode Mode to check
     */
    toggleMode(mode: EditorMode) {
        const newMode = (this.state.mode == mode) ? 'normal' : mode;
        this.setState({ mode: newMode });
    }

    renderStyleEditor() {
        const onStyleChange = (css: string) => {
            this.setState({ customCss: css });
        }

        return <>
            <AceEditor
                mode="css"
                theme="github"
                onChange={onStyleChange}
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

    renderTemplateChanger() {
        let templateNames = Object.keys(ResumeTemplateProvider.templates);
        let navItems = templateNames.map((key: string) => <Nav.Item key={key}>
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

    get resumeHotKeysProps() {
        const togglePrintMode = () => this.toggleMode('printing');

        return {
            mode: this.state.mode,
            copyClipboard: this.copyClipboard,
            pasteClipboard: this.pasteClipboard,
            togglePrintMode: togglePrintMode,
            reset: this.reset
        }
    }

    render() {
        const resumeToolbar = !this.isPrinting ? <ButtonToolbar>
            <Button className="mr-2" onClick={this.addSection}>Add Section</Button>
            <Button className="mr-2" onClick={this.addColumn}>Add Multi-Column Row</Button>
        </ButtonToolbar> : <></>

        const resume = <div id="resume" className={this.resumeClassName}>
            <ResumeHotKeys {...this.resumeHotKeysProps} {...this.state} />
            {this.state.children.map(this.childMapper)}

            {resumeToolbar}
        </div>

        const toggleStyleEditor = () => this.toggleMode('editingStyle');
        const pasteEnabled = this.isNodeSelected && this.state.clipboard != undefined;

        const toolbar = <TopNavBar
            mode={this.state.mode}
            copyClipboard={this.isNodeSelected ? this.copyClipboard : undefined}
            pasteClipboard={pasteEnabled ? this.pasteClipboard : undefined}
            unselect={this.isNodeSelected ? this.unselect : undefined}
            loadData={this.loadData}
            saveFile={this.saveFile}
            changeTemplate={this.changeTemplate}
            toggleStyleEditor={toggleStyleEditor}
        />

        let main = resume;

        switch (this.state.mode) {
            case 'editingStyle':
                return <ResizableSidebarLayout
                    topNav={toolbar}
                    main={resume}
                    sideBar={this.renderStyleEditor()}
                />
            case 'changingTemplate':
                return <StaticSidebarLayout
                    topNav={toolbar}
                    main={resume}
                    sideBar={this.renderTemplateChanger()}
                />
            case 'landing':
                main = <Landing className={this.resumeClassName} />
            default:
                return <DefaultLayout
                    topNav={toolbar}
                    main={main} />
        }
    }

    /** Return everything back to default settings */
    reset() {
        this.unselect();
        this.setState({ mode: 'normal' });
    }
}

export default Resume;