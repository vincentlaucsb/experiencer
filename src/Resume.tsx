import * as React from 'react';
import { saveAs } from 'file-saver';
import { ContextMenuTrigger } from "react-contextmenu";

import 'purecss/build/pure-min.css';
import 'react-quill/dist/quill.snow.css';
import './scss/index.scss';
import './fonts/icofont.min.css';

import ResumeComponent, { EditorMode } from './components/ResumeComponent';
import { assignIds, deepCopy, arraysEqual } from './components/Helpers';
import { Action, NodeProperty } from './components/ResumeNodeBase';
import ResumeTemplateProvider from './components/templates/ResumeTemplateProvider';
import { ResizableSidebarLayout, StaticSidebarLayout, DefaultLayout } from './components/controls/Layouts';
import Landing from './components/help/Landing';
import TopNavBar from './components/controls/TopNavBar';
import ResumeHotKeys from './components/controls/ResumeHotkeys';
import ResumeState, { ResumeSaveData } from './components/controls/ResumeState';
import Help from './components/help/Help';
import HoverTracker, { IdType } from './components/utility/HoverTracker';
import TopEditingBar, { EditingBarProps } from './components/controls/TopEditingBar';
import ResumeNodeTree, { ResumeNode, BasicResumeNode } from './components/utility/NodeTree';
import CssNode from './components/utility/CssTree';
import PureMenu, { PureMenuLink, PureMenuItem } from './components/controls/menus/PureMenu';
import { Button } from './components/controls/Buttons';
import { RenderIf } from './components/controls/HelperComponents';
import { SelectedNodeActions } from './components/controls/SelectedNodeActions';
import CssEditor from './components/utility/CssEditor';
import NodeTreeVisualizer from './components/utility/NodeTreeVisualizer';
import Tabs from './components/controls/Tabs';
import ResumeContextMenu from './components/controls/ResumeContextMenu';
import generateHtml from './components/utility/GenerateHtml';
import ComponentTypes from './components/schema/ComponentTypes';

class Resume extends React.Component<{}, ResumeState> {
    hovering = new HoverTracker();
    nodes = new ResumeNodeTree();
    css = new CssNode("Resume CSS", {}, "#resume");
    shouldUpdateCss = false;
    style: HTMLStyleElement;
    unselect: Action;
    resumeRef = React.createRef<HTMLDivElement>();
    undo = new Array<Array<ResumeNode>>();
    redo = new Array<Array<ResumeNode>>();

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
            isEditingSelected: false,
            mode: "landing"
        };
        
        this.handleClick = this.handleClick.bind(this);
        this.print = this.print.bind(this);
        this.toggleMode = this.toggleMode.bind(this);

        /** Resume Nodes */
        this.updateNodes = this.updateNodes.bind(this);
        this.undoChange = this.undoChange.bind(this);
        this.redoChange = this.redoChange.bind(this);
        this.addCssClasses = this.addCssClasses.bind(this);
        this.addHtmlId = this.addHtmlId.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.updateNestedChild = this.updateNestedChild.bind(this);

        /** Templates and Styling **/
        this.renderSidebar = this.renderSidebar.bind(this);
        this.changeTemplate = this.changeTemplate.bind(this);
        this.renderCssEditor = this.renderCssEditor.bind(this);

        /** Load & Save */
        this.exportHtml = this.exportHtml.bind(this);
        this.loadData = this.loadData.bind(this);
        this.saveLocal = this.saveLocal.bind(this);
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

    /** Returns true if we are actively editing a resume */
    get isEditing(): boolean {
        return this.state.mode === 'normal'
            || this.state.mode === 'help'
            || (this.state.children.length > 0);
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
                this.setState({ hoverNode: this.hovering.currentId });
            },

            // Remove an ID from the set of nodes we are hovering over
            hoverOut: () => {
                this.hovering.hoverOut();
                this.setState({ hoverNode: this.hovering.currentId });
            },
            
            // Determines if a node is selectable or not
            isSelectBlocked: (id: IdType) => {
                return !arraysEqual(id, this.hovering.currentId);
            },

            selectedUuid: this.selectedNode ? this.selectedNode.uuid : undefined,

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
     */
    componentDidUpdate(_prevProps) {
        if (this.shouldUpdateCss) {
            this.style.innerHTML = this.state.css.stylesheet();
            this.shouldUpdateCss = false;
        }
    }

    /**
     * Handles clicks on the resume
     * @param event
     */
    handleClick(event: React.MouseEvent) {
        if (this.state.mode === 'changingTemplate') {
            this.toggleMode();
        } else {
            this.editSelected();
        }
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
            this.css.addNode(root);
            this.setState({
                css: this.css,
                children: this.nodes.children
            });
        }
    }

    addCssClasses(classes: string) {
        const currentNode = this.selectedNode as ResumeNode;
        if (currentNode) {
            currentNode.classNames = classes;
            this.setState({ children: this.nodes.children });
        }
    }

    updateNodes(callback: (nodes: ResumeNodeTree) => void) {
        this.undo.push(deepCopy(this.state.children));
        callback(this.nodes);

        this.setState({
            children: this.nodes.children
        });
    }

    undoChange() {
        const prev = this.undo.pop();

        // prev.length > 0 avoids undoing the initial template load
        if (prev && prev.length > 0) {
            this.redo.push([...this.state.children]);
            this.nodes.children = prev;
            this.setState({
                children: prev
            });
        }
    }

    redoChange() {
        const next = this.redo.pop();
        if (next) {
            this.updateNodes((nodes) => nodes.children = next);
        }
    }

    /**
     * Add an immediate child
     * @param node Node to be added
     */
    addChild<T extends BasicResumeNode>(node: T) {
        this.updateNodes((nodes) => nodes.addChild(assignIds(node)));
    }

    /**
     * Add node as a child to the node identified by id
     * @param id   Hierarchical id pointing to some node
     * @param node Node to be added
     */
    addNestedChild(id: IdType, node: ResumeNode) {
        this.updateNodes((nodes) => nodes.addNestedChild(id, node));
    }

    deleteSelected() {
        const id = this.state.selectedNode as IdType;
        if (id) {
            this.updateNodes((nodes) => nodes.deleteChild(id));
            this.hovering.hoverOut();
            this.setState({
                hoverNode: this.hovering.currentId,
                selectedNode: undefined
            });
        }
    }

    updateNestedChild(id: IdType, key: string, data: any) {
        this.updateNodes((nodes) => nodes.updateChild(id, key, data));
    }

    updateSelected(key: string, data: NodeProperty) {
        const id = this.state.selectedNode as IdType;
        if (id) {
            this.updateNodes((nodes) => nodes.updateChild(id, key, data));
        }
    }

    editSelected() {
        this.setState({ isEditingSelected: true });
    }

    get moveSelectedUpEnabled() {
        const id = this.state.selectedNode as IdType;
        return id && id[id.length - 1] > 0;
    }

    moveSelectedUp() {
        const id = this.state.selectedNode as IdType;
        if (this.moveSelectedUpEnabled) {
            this.updateNodes((nodes) => {
                this.setState({ selectedNode: nodes.moveUp(id) });
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
            this.updateNodes((nodes) => {
                this.setState({ selectedNode: nodes.moveDown(id) });
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
        // Default target: root
        let target: IdType = [];
        if (this.state.selectedNode) {
            target = this.state.selectedNode;
        }

        // UUIDs will be added in the method below
        this.addNestedChild(target, deepCopy(this.state.clipboard));
    }
    //#endregion
    
    //#region Serialization
    exportHtml() {
        // TODO: Make this user defineable
        const filename = 'resume.html';
        let resumeHtml = this.resumeRef.current ? this.resumeRef.current.outerHTML : '';
        var blob = new Blob(
            [generateHtml(this.css.stylesheet(), resumeHtml)],
            { type: "text/html;charset=utf-8" }
        );

        saveAs(blob, filename);
    }

    loadData(data: object, mode: EditorMode = 'normal') {
        let savedData = data as ResumeSaveData;
        this.updateNodes((nodes) => nodes.children = assignIds(savedData.children));
        this.css = CssNode.load(savedData.builtinCss);

        this.setState({
            css: this.css,
            mode: mode
        })

        this.shouldUpdateCss = true;
    }

    loadLocal() {
        const savedData = localStorage.getItem('experiencer');
        if (savedData) {
            try {
                this.loadData(JSON.parse(savedData));
            }
            catch {
                // TODO: Show an error message
                console.log("Nope, that didn't work.");
            }
        }
    }

    dump(): ResumeSaveData {
        return {
            children: this.state.children,
            builtinCss: this.css.dump()
        };
    }

    saveLocal() {
        localStorage.setItem('experiencer', JSON.stringify(this.dump()));
    }

    // Save data to an external file
    saveFile(filename: string) {
        var blob = new Blob([JSON.stringify(this.dump())],
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
            delete: this.deleteSelected,
            moveUp: this.moveSelectedUp,
            moveDown: this.moveSelectedDown,

            copyClipboard: this.copyClipboard,
            cutClipboard: this.cutClipboard,
            pasteClipboard: this.pasteClipboard
        }
    }

    get topMenuProps() {
        let props = {
            changeTemplate: this.changeTemplate,
            exportHtml: this.exportHtml,
            mode: this.state.mode,
            loadData: this.loadData,
            print: this.print,
            saveLocal: this.saveLocal,
            saveFile: this.saveFile,
            toggleHelp: () => this.toggleMode('help'),
            toggleLanding: () => this.setState({ mode: 'landing' })
        }
                    
        return props;
    }

    get editingBarProps() : EditingBarProps {
        return {
            ...this.selectedNodeActions,
            selectedNodeId: this.state.selectedNode,
            selectedNode: this.selectedNode,
            addHtmlId: this.addHtmlId,
            addCssClasses: this.addCssClasses,
            updateNode: this.updateSelected,
            addChild: this.addNestedChild,
            moveUpEnabled: this.moveSelectedUpEnabled,
            moveDownEnabled: this.moveSelectedDownEnabled,
            unselect: this.unselect,
            updateSelected: this.updateSelected,
            undo: this.undoChange,
            redo: this.redoChange
        }
    }

    get resumeHotKeysProps() {
        return {
            ...this.selectedNodeActions,
            undo: this.undoChange,
            redo: this.redoChange,
            togglePrintMode: () => this.toggleMode('printing'),
            reset: () => {
                this.unselect();
                this.setState({ mode: 'normal' });
            }
        }
    }

    print() {
        requestAnimationFrame(() => {
            const prevState = { ...this.state };

            this.setState({
                selectedNode: undefined,
                mode: 'printing'
            });

            window.print();

            this.setState(prevState);
        });
    }
    //#endregion

    renderSidebar() {
        let CssEditor = this.renderCssEditor;
        return <Tabs>
            <NodeTreeVisualizer key="Tree" childNodes={this.state.children}
                selectNode={(id) => this.setState({ selectedNode: id })}
                selectedNode={this.state.selectedNode}
            />
            <CssEditor key="CSS" />
            <div key="Raw CSS">
                <pre>
                    <code>
                        {this.state.css.stylesheet()}
                    </code>
                </pre>
            </div>
        </Tabs>
    }

    renderCssEditor() {
        const adder = (path, name, selector) => {
            (this.css.findNode(path) as CssNode).add(name, {}, selector);
            this.setState({ css: this.css });
            this.shouldUpdateCss = true;
        }

        const updater = (path, key, value) => {
            this.css.setProperty(path, key, value);
            this.setState({ css: this.css });
            this.shouldUpdateCss = true;
        };

        const updateDescription = (path, value) => {
            const target = this.css.findNode(path);
            if (target) {
                target.description = value;
            }

            this.setState({ css: this.css });
            this.shouldUpdateCss = true;
        }

        const deleter = (path, key) => {
            this.css.deleteProperty(path, key);
            this.setState({ css: this.css });
            this.shouldUpdateCss = true;
        };

        const deleteNode = (path) => {
            this.css.delete(path);
            this.setState({ css: this.css });
            this.shouldUpdateCss = true;
        }

        const editorProps = {
            addSelector: adder,
            updateData: updater,
            updateDescription: updateDescription,
            deleteKey: deleter,
            deleteNode: deleteNode
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
                
        return <CssEditor root={this.state.css} autoCollapse={true} {...editorProps} />
    }
    
    render() {
        const resume = <div id="resume-container">
            <ContextMenuTrigger id="resume-menu">
                <div id="resume" ref={this.resumeRef}
                    onClick={this.handleClick}
                    onContextMenu={() => this.setState({
                    selectedNode: this.hovering.currentId })}>
                    <ResumeHotKeys {...this.resumeHotKeysProps} />
                
                    {this.state.children.map((elem, idx, arr) => {
                        const uniqueId = elem.uuid;
                        const props = {
                            ...elem,
                            mode: this.state.mode,
                            updateData: this.updateNestedChild,
                            ...this.hoverProps,

                            isEditing: this.state.isEditingSelected,
                            index: idx,
                            numSiblings: arr.length
                        };

                    return <ResumeComponent key={uniqueId} {...props} />
                    })}
                </div>
            </ContextMenuTrigger>

            <ResumeContextMenu
                nodes={this.nodes}
                currentId={this.state.selectedNode}
                selectNode={(id) => this.setState({selectedNode: id})}
            />
        </div>
        
        const topEditingBar = this.isEditing ? <TopEditingBar {...this.editingBarProps} /> : <></>
        const editingTop = <RenderIf render={!this.isPrinting}>
            <header id="app-header" className="no-print">
                <TopNavBar {...this.topMenuProps} />
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
                const main = <Landing loadLocal={() => { this.loadLocal() }} />
                return <DefaultLayout
                    topNav={editingTop}
                    main={main} />
            case 'printing':
                return resume;
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