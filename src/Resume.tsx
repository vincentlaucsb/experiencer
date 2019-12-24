import * as React from 'react';
import { saveAs } from 'file-saver';

import 'purecss/build/pure-min.css';
import 'react-quill/dist/quill.snow.css';
import './scss/index.scss';

import ResumeComponent, { EditorMode, ComponentTypes } from './components/ResumeComponent';
import { assignIds, deepCopy, arraysEqual } from './components/Helpers';
import { Action, ResumeNodeProps } from './components/ResumeNodeBase';
import ResumeTemplateProvider from './components/templates/ResumeTemplateProvider';
import { ResizableSidebarLayout, StaticSidebarLayout, DefaultLayout } from './components/controls/Layouts';
import Landing from './components/help/Landing';
import TopNavBar from './components/controls/TopNavBar';
import ResumeHotKeys from './components/controls/ResumeHotkeys';
import ResumeState, { ResumeSaveData } from './components/controls/ResumeState';
import StyleEditor from './components/controls/StyleEditor';
import Help from './components/help/Help';
import HoverTracker, { IdType } from './components/utility/HoverTracker';
import TopEditingBar, { EditingBarProps } from './components/controls/TopEditingBar';
import ResumeNodeTree, { ResumeNode, BasicResumeNode } from './components/utility/NodeTree';
import CssNode from './components/utility/CssTree';
import PureMenu, { PureMenuLink, PureMenuItem } from './components/controls/PureMenu';
import { Button } from './components/controls/Buttons';
import Octicon, { Home } from "@primer/octicons-react";
import { RenderIf } from './components/controls/HelperComponents';
import FileLoader from './components/controls/FileLoader';
import FileSaver from './components/controls/FileSaver';
import { SelectedNodeActions } from './components/controls/SelectedNodeActions';
import CssEditor from './components/utility/CssEditor';
import Row from './components/Row';
import Section from './components/Section';
import Grid from './components/Grid';
import NodeTreeVisualizer from './components/utility/NodeTreeVisualizer';
import Tabs from './components/controls/Tabs';

class Resume extends React.Component<{}, ResumeState> {
    hovering = new HoverTracker();
    nodes = new ResumeNodeTree();
    css = new CssNode("Resume CSS", {}, "#resume");
    shouldUpdateCss = false;
    style: HTMLStyleElement;
    unselect: Action;

    constructor(props) {
        super(props);

        // Custom CSS
        const head = document.getElementsByTagName("head")[0];
        this.style = document.createElement("style");
        this.style.innerHTML = "";
        head.appendChild(this.style);

        this.state = {
            css: this.css,
            children: [],
            additionalCss: "",
            mode: "landing",
            sectionTitlePosition: "top"
        };
        this.renderStyle();

        this.print = this.print.bind(this);
        this.toggleMode = this.toggleMode.bind(this);

        /** Resume Nodes */
        this.addHtmlId = this.addHtmlId.bind(this);
        this.addColumn = this.addColumn.bind(this);
        this.addSection = this.addSection.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.updateNestedChild = this.updateNestedChild.bind(this);

        /** Templates and Styling **/
        this.renderSidebar = this.renderSidebar.bind(this);
        this.changeTemplate = this.changeTemplate.bind(this);
        this.renderStyle = this.renderStyle.bind(this);
        this.renderCssEditor = this.renderCssEditor.bind(this);

        /** Load & Save */
        this.loadData = this.loadData.bind(this);
        this.saveFile = this.saveFile.bind(this);

        this.editSelected = this.editSelected.bind(this);
        this.deleteSelected = this.deleteSelected.bind(this);
        this.moveSelectedUp = this.moveSelectedUp.bind(this);
        this.moveSelectedDown = this.moveSelectedDown.bind(this);
        this.updateSelected = this.updateSelected.bind(this);

        /** Cut & Paste */
        this.copyClipboard = this.copyClipboard.bind(this);
        this.cutClipboard = this.cutClipboard.bind(this);
        this.pasteClipboard = this.pasteClipboard.bind(this);

        // Unselect the currently selected node
        this.unselect = () => {
            this.setState({ selectedNode: undefined });
        };
    }
    

    /** Prevent component from being edited from the template changing screen */
    get isEditable(): boolean {
        return !this.isPrinting && !(this.state.mode === 'changingTemplate');
    }

    get isPrinting(): boolean {
        return this.state.mode === 'printing';
    }

    /** Return props related to hover/select functionality */
    get hoverProps() {
        return {
            // Add an ID to the set of nodes we are hovering over
            hoverOver: (id: IdType) => {
                this.hovering.hoverOver(id);
                this.setState({
                    hoverNode: this.hovering.currentId
                });
            },

            // Remove an ID from the set of nodes we are hovering over
            hoverOut: (id: IdType) => {
                this.hovering.hoverOut(id);
                this.setState({
                    hoverNode: this.hovering.currentId
                });
            },

            // Determines if we are currently hovering over a node
            isHovering: this.hovering.isHovering,

            // Determines if a node is selectable or not
            isSelectBlocked: (id: IdType) => {
                return !arraysEqual(id, this.hovering.currentId);
            },

            // Returns true if the given node is currently selected
            isSelected: (uuid: string) => {
                return this.selectedNode ? uuid === this.selectedNode['uuid'] : false;
            },

            // Update the selected node
            updateSelected: (id?: IdType) => {
                this.setState({ selectedNode: id });
            },

            unselect: this.unselect
        }
    }

    /** Retrieve the selected node **/
    get selectedNode() {
        if (this.state.selectedNode) {
            return this.nodes.getNodeById(this.state.selectedNode);
        }

        return undefined;
    }

    /**
     * Update stylesheets
     * @param prevProps
     * @param prevState
     */
    componentDidUpdate(_prevProps, prevState: ResumeState) {
        if (this.shouldUpdateCss) {
            this.renderStyle();
            this.shouldUpdateCss = false;
        }

        // If the previously selected node was editing, bring it
        // out of an editing state
        if (prevState.selectedNode && (prevState.selectedNode !== this.state.selectedNode)) {
            // Make sure node wasn't deleted before we try to modify it
            const prevNode = this.nodes.getNodeById(prevState.selectedNode);
            if (prevNode) {
                (prevNode as ResumeNodeProps).isEditing = false;
            }
        }
    }

    // Push style changes to browser
    renderStyle() {
        this.style.innerHTML = `
${this.state.css.stylesheet()}

${this.state.additionalCss}`;
    }

    /**
     * Switch into mode if not already. Otherwise, return to normal.
     * @param mode Mode to check
     */
    toggleMode(mode: EditorMode = 'normal') {
        const newMode = (this.state.mode === mode) ? 'normal' : mode;
        this.setState({ mode: newMode });
    }

    //#region Changing Templates
    changeTemplate() {
        this.loadData(
            ResumeTemplateProvider.templates['Integrity'](),
            'changingTemplate'
        );
    }

    renderTemplateChanger() {
        const loadTemplate = (key: string) => {
            const template = ResumeTemplateProvider.templates[key]();
            this.setState({ activeTemplate: key, });
            this.loadData(template, 'changingTemplate');
        };

        const templateNames = Object.keys(ResumeTemplateProvider.templates);
        let navItems = templateNames.map((key: string) =>
            <PureMenuItem key={key} onClick={() => loadTemplate(key)}>
                <PureMenuLink>{key}</PureMenuLink>
            </PureMenuItem>
        );

        return (
            <>
                <PureMenu>
                    {navItems}
                </PureMenu>
                <Button onClick={() => this.toggleMode()}>Use this Template</Button>
            </>
        );
    }
    //#endregion

    //#region Creating/Editing Nodes
    addHtmlId(htmlId: string) {
        const currentNode = this.selectedNode as ResumeNode;
        if (currentNode) {
            let root = new CssNode(`#${htmlId}`, {}, `#${htmlId}`);
            let copyTree = this.css.findNode(
                ComponentTypes.cssName(currentNode.type)) as CssNode;

            if (copyTree) {
                root = copyTree.copySkeleton(`#${htmlId}`, `#${htmlId}`);
            }

            currentNode.htmlId = htmlId;
            this.css.add(root);
            this.setState({
                css: this.css,
                children: this.nodes.children
            });
        }
    }

    addSection() {
        this.addChild({
            type: Section.type,
            headerPosition: this.state.sectionTitlePosition
        });
    }

    addColumn() {
        this.addChild(ComponentTypes.defaultValue(Row.type).node);
    }

    /**
     * Add an immediate child
     * @param node Node to be added
     */
    addChild<T extends BasicResumeNode>(node: T) {
        this.nodes.addChild(assignIds(node));
        this.setState({ children: this.nodes.children });
    }

    /**
     * Add node as a child to the node identified by id
     * @param id   Hierarchical id pointing to some node
     * @param node Node to be added
     */
    addNestedChild(id: IdType, node: ResumeNode) {
        this.nodes.addNestedChild(id, node);
        this.setState({ children: this.nodes.children });
    }

    deleteSelected() {
        const id = this.state.selectedNode as IdType;
        if (id) {
            this.nodes.deleteChild(id);
            this.hovering.hoverOut(id);
            this.setState({
                children: this.nodes.children,
                hoverNode: this.hovering.currentId,
                selectedNode: undefined
            });
        }
    }

    updateNestedChild(id: IdType, key: string, data: any) {
        this.nodes.updateChild(id, key, data);
        this.setState({ children: this.nodes.children });
    }

    updateSelected(key: string, data: string | string[] | boolean) {
        const id = this.state.selectedNode as IdType;
        if (id) {
            this.nodes.updateChild(id, key, data);
            this.setState({ children: this.nodes.children });
        }
    }

    editSelected() {
        const id = this.state.selectedNode as IdType;
        if (id) {
            this.nodes.toggleEdit(id);
            this.setState({ children: this.nodes.children });
        }
    }

    get moveSelectedUpEnabled() {
        const id = this.state.selectedNode as IdType;
        return id && id[id.length - 1] > 0;
    }

    moveSelectedUp() {
        const id = this.state.selectedNode as IdType;
        if (this.moveSelectedUpEnabled) {
            this.setState({
                children: this.nodes.children,
                selectedNode: this.nodes.moveUp(id)
            });
        }
    }

    get moveSelectedDownEnabled() {
        const id = this.state.selectedNode as IdType;
        return id && !this.nodes.isLastSibling(id);
    }

    moveSelectedDown() {
        const id = this.state.selectedNode as IdType;
        if (this.moveSelectedDownEnabled) {
            this.setState({
                children: this.nodes.children,
                selectedNode: this.nodes.moveDown(id)
            });
        }
    }
    //#endregion

    //#region Clipboard
    /** Copy the currently selected node */
    copyClipboard() {
        if (this.selectedNode) {
            this.setState({ clipboard: deepCopy(this.selectedNode) });
        }
    }

    cutClipboard() {
        // Implement as Copy + Delete
        if (this.selectedNode) {
            this.copyClipboard();
            this.deleteSelected();
        }
    }

    /** Paste whatever is currently in the clipboard */
    pasteClipboard() {
        if (this.selectedNode) {
            // UUIDs will be added in the method below
            this.addNestedChild(this.state.selectedNode as IdType,
                deepCopy(this.state.clipboard));
        }
    }
    //#endregion
    
    //#region Serialization
    loadData(data: object, mode: EditorMode = 'normal') {
        let savedData = data as ResumeSaveData;
        this.nodes.children = assignIds(savedData.children);
        this.css = CssNode.load(savedData.builtinCss);

        this.setState({
            css: this.css,
            children: this.nodes.children,
            additionalCss: savedData.css as string,
            mode: mode
        })

        this.shouldUpdateCss = true;
    }

    // Save data to an external file
    saveFile(filename: string) {
        const data: ResumeSaveData = {
            children: this.state.children,
            builtinCss: this.css.dump(),
            css: this.state.additionalCss
        };

        var blob = new Blob([JSON.stringify(data)],
            {
                type: "text/plain;charset=utf-8"
            }
        );

        saveAs(blob, filename);
    }
    //#endregion

    //#region Helper Component Props
    get selectedNodeActions() : SelectedNodeActions {
        return {
            edit: this.editSelected,
            delete: this.deleteSelected,
            moveUp: this.moveSelectedUp,
            moveDown: this.moveSelectedDown,

            copyClipboard: this.copyClipboard,
            cutClipboard: this.cutClipboard,
            pasteClipboard: this.pasteClipboard
        }
    }

    get toolbarProps() {
        let props = {
            mode: this.state.mode,
            loadData: this.loadData,
            saveFile: this.saveFile,
            changeTemplate: this.changeTemplate,
            toggleHelp: () => this.toggleMode('help'),
            toggleLanding: () => this.setState({ mode: 'landing' })
        }

        return props;
    }

    get editingBarProps() {
        return {
            ...this.selectedNodeActions,
            id: this.state.selectedNode,
            node: this.selectedNode,
            addHtmlId: this.addHtmlId,
            updateNode: this.updateSelected,
            addChild: this.addNestedChild,
            toggleEdit: this.editSelected,
            moveUpEnabled: this.moveSelectedUpEnabled,
            moveDownEnabled: this.moveSelectedDownEnabled,
            unselect: this.unselect,
            updateSelected: this.updateSelected
        }
    }

    get resumeHotKeysProps() {
        return {
            ...this.selectedNodeActions,
            togglePrintMode: () => this.toggleMode('printing'),
            reset: () => {
                this.unselect();
                this.setState({ mode: 'normal' });
            }
        }
    }

    print() {
        requestAnimationFrame(() => {
            this.setState({ mode: 'printing' });
            window.print();
            this.setState({ mode: 'normal' });
        });
    }
    //#endregion

    renderSidebar() {
        let CssEditor = this.renderCssEditor;
        const styleEditorProps = {
            additionalCss: this.state.additionalCss,
            onStyleChange: (css: string) => {
                this.setState({ additionalCss: css });
            },
            renderStyle: this.renderStyle,
        }

        return <Tabs>
            <NodeTreeVisualizer key="Tree" childNodes={this.state.children}
                selectNode={(id) => this.setState({ selectedNode: id })}
            />
            <CssEditor key="CSS" />
            <StyleEditor key="Raw CSS" {...styleEditorProps} />
        </Tabs>
    }

    renderCssEditor() {
        const adder = (path, name, selector) => {
            (this.css.findNode(path) as CssNode).add(new CssNode(name, {}, selector));
            this.setState({ css: this.css });
            this.shouldUpdateCss = true;
        }

        const updater = (path, key, value) => {
            this.css.setProperty(path, key, value);
            this.setState({ css: this.css });
            this.shouldUpdateCss = true;
        };

        const deleter = (path, key) => {
            this.css.deleteProperty(path, key);
            this.setState({ css: this.css });
            this.shouldUpdateCss = true;
        };

        const editorProps = {
            isPrinting: this.isPrinting,
            addSelector: adder,
            updateData: updater,
            deleteData: deleter
        }

        if (this.selectedNode) {
            const rootNode = this.state.css.findNode(
                ComponentTypes.cssName(this.selectedNode.type)) as CssNode;

            let specificCssEditor = <></>
            if (this.selectedNode.htmlId && this.state.css.findNode([`#${this.selectedNode.htmlId}`])) {
                const specificRoot = this.state.css.findNode([`#${this.selectedNode.htmlId}`]) as CssNode;
                specificCssEditor = <CssEditor key={specificRoot.fullSelector} root={specificRoot}
                    {...editorProps} />
            }

            if (rootNode) {
                return <>
                    {specificCssEditor}
                    <CssEditor {...editorProps} key={rootNode.fullSelector} root={rootNode} />
                </>
            }

            return <></>
        }
                
        return <CssEditor root={this.state.css} {...editorProps} />
    }

    render() {
        // TODO: Make this moar better
        const Toolbar = (props: any) => {
           return <>{props.children}</>
        };

        const resume = <div id="resume-container">
            <div id="resume">
            <ResumeHotKeys {...this.resumeHotKeysProps} />
            {this.state.children.map((elem, idx, arr) => {

                const uniqueId = elem.uuid;
                const props = {
                    ...elem,
                    mode: this.state.mode,
                    toggleEdit: this.editSelected.bind(this),
                    updateData: this.updateNestedChild,
                    ...this.hoverProps,

                    index: idx,
                    numSiblings: arr.length
                };

                return <ResumeComponent key={uniqueId} {...props} />
            })}
            </div>
        </div>

        let main = resume;

        const topEditingBar = this.state.selectedNode ? <TopEditingBar {...this.editingBarProps as EditingBarProps} /> : <div id="toolbar"
            className="no-print">
            <div className="toolbar-section">
                <PureMenu horizontal>
                    <Button><Octicon icon={Home} />Home</Button>
                    <Button onClick={this.changeTemplate}>New</Button>
                    <FileLoader loadData={this.loadData} />
                    <FileSaver saveFile={this.saveFile} />
                    <Button onClick={this.print}>Print</Button>
                </PureMenu>
                <span className="label">File</span>
            </div>
            <div className="toolbar-section">
                <PureMenu horizontal>
                    <Button onClick={this.addSection}>Add Section</Button>
                    <Button onClick={this.addColumn}>Add Rows & Columns</Button>
                    <Button onClick={() => this.addChild(ComponentTypes.defaultValue(Grid.type).node)}>Add Grid</Button>
                </PureMenu>
                <span className="label">Resume Components</span>
            </div>
        </div>
        
        const editingTop = <RenderIf render={!this.isPrinting}>
            <header id="app-header" className="no-print">
                <TopNavBar {...this.toolbarProps} />
                {topEditingBar}
            </header>
        </RenderIf>

        // Render the final layout based on editor mode
        switch (this.state.mode) {
            case 'help':
                return <ResizableSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    sideBar={<Help close={() => this.toggleMode()} />}
                />
            case 'changingTemplate':
                return <StaticSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    sideBar={this.renderTemplateChanger()}
                />
            case 'landing':
                main = <Landing />
                return <DefaultLayout
                    topNav={editingTop}
                    main={main} />
            default:
                return <ResizableSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    isPrinting={this.isPrinting}
                    sideBar={this.renderSidebar()}
            />
        }
    }
}

export default Resume;