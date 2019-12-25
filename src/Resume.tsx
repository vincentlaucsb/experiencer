import * as React from 'react';
import { saveAs } from 'file-saver';
import { ContextMenuTrigger } from "react-contextmenu";

import 'purecss/build/pure-min.css';
import 'react-quill/dist/quill.snow.css';
import './scss/index.scss';

import ResumeComponent, { EditorMode, ComponentTypes } from './components/ResumeComponent';
import { assignIds, deepCopy, arraysEqual } from './components/Helpers';
import { Action, ResumeNodeProps, NodeProperty } from './components/ResumeNodeBase';
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
import PureMenu, { PureMenuLink, PureMenuItem } from './components/controls/PureMenu';
import { Button } from './components/controls/Buttons';
import { RenderIf } from './components/controls/HelperComponents';
import { SelectedNodeActions } from './components/controls/SelectedNodeActions';
import CssEditor from './components/utility/CssEditor';
import NodeTreeVisualizer from './components/utility/NodeTreeVisualizer';
import Tabs from './components/controls/Tabs';
import ResumeContextMenu from './components/controls/ResumeContextMenu';

class Resume extends React.Component<{}, ResumeState> {
    hovering = new HoverTracker();
    nodes = new ResumeNodeTree();
    css = new CssNode("Resume CSS", {}, "#resume");
    shouldUpdateCss = false;
    style: HTMLStyleElement;
    unselect: Action;
    resumeRef: React.RefObject<HTMLDivElement>;
    prevHoverNode: number[] | undefined;

    constructor(props) {
        super(props);

        this.resumeRef = React.createRef<HTMLDivElement>();

        // Custom CSS
        const head = document.getElementsByTagName("head")[0];
        this.style = document.createElement("style");
        this.style.innerHTML = "";
        head.appendChild(this.style);

        this.state = {
            css: this.css,
            children: [],
            mode: "landing"
        };
        this.renderStyle();

        this.print = this.print.bind(this);
        this.toggleMode = this.toggleMode.bind(this);

        /** Resume Nodes */
        this.addHtmlId = this.addHtmlId.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.updateNestedChild = this.updateNestedChild.bind(this);

        /** Templates and Styling **/
        this.renderSidebar = this.renderSidebar.bind(this);
        this.changeTemplate = this.changeTemplate.bind(this);
        this.renderStyle = this.renderStyle.bind(this);
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
    

    /** Prevent component from being edited from the template changing screen */
    get isEditable(): boolean {
        return !this.isPrinting && !(this.state.mode === 'changingTemplate');
    }

    /** Returns true if we are actively editing a resume */
    get isEditing(): boolean {
        return this.isEditable && (this.state.children.length > 0);
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
        this.style.innerHTML = this.state.css.stylesheet();
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

    updateSelected(key: string, data: NodeProperty) {
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
    exportHtml() {
        // TODO: Make this user defineable
        const filename = 'resume.html';

        let resumeHtml = '';
        if (this.resumeRef.current) {
            resumeHtml = this.resumeRef.current.outerHTML;
        }

        let html = `<!doctype html>

<html lang="en">
    <head>
        <title>Resume</title>
        <meta charset="utf-8">
        <style>
            ${this.css.stylesheet()}
        </style>
        <link href="https://fonts.googleapis.com/css?family=Merriweather|Open+Sans&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0">
        ${resumeHtml}
    </body>
</html>
`

        var blob = new Blob([html],
            {
                type: "text/html;charset=utf-8"
            }
        );

        saveAs(blob, filename);
    }

    loadData(data: object, mode: EditorMode = 'normal') {
        let savedData = data as ResumeSaveData;
        this.nodes.children = assignIds(savedData.children);
        this.css = CssNode.load(savedData.builtinCss);

        this.setState({
            css: this.css,
            children: this.nodes.children,
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
            edit: this.editSelected,
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
            (this.css.findNode(path) as CssNode).add(new CssNode(name, {}, selector));
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
        // TODO: Make this moar better
        const Toolbar = (props: any) => {
           return <>{props.children}</>
        };

        const resume = <div id="resume-container">
            <ContextMenuTrigger id="resume-menu">
                <div id="resume" ref={this.resumeRef} onContextMenu={() => this.setState({
                    selectedNode: this.hovering.currentId })}>
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
            </ContextMenuTrigger>

            <ResumeContextMenu
                nodes={this.nodes}
                currentId={this.state.selectedNode}
                selectNode={(id) => this.setState({selectedNode: id})}
            />
        </div>

        let main = resume;

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
                main = <Landing loadLocal={() => { this.loadLocal() }} />
                return <DefaultLayout
                    topNav={editingTop}
                    main={main} />
            case 'printing':
                return main;
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