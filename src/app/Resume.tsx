import * as React from 'react';
import { saveAs } from 'file-saver';
import { ContextMenuTrigger } from "@/controls/ContextMenu";

import 'purecss/build/pure-min.css';
import 'react-quill/dist/quill.snow.css';
import '@/shared/scss/index.scss';
import '@/assets/fonts/icofont.min.css';

import ResumeComponentFactory from '@/resume/ResumeComponent';
import { assignIds, deepCopy, createContainer } from '@/shared/utils/Helpers';
import ResumeTemplates from '@/templates/ResumeTemplates';
import { ResizableSidebarLayout, StaticSidebarLayout, DefaultLayout } from '@/controls/Layouts';
import Landing from '@/help/Landing';
import TopNavBar, { TopNavBarProps } from '@/controls/TopNavBar';
import ResumeHotKeys from '@/controls/ResumeHotkeys';
import Help from '@/help/Help';
import TopEditingBar, { EditingBarProps } from '@/controls/TopEditingBar';
import CssNode, { ReadonlyCssNode } from '@/shared/utils/CssTree';
import PureMenu, { PureMenuLink, PureMenuItem } from '@/controls/menus/PureMenu';
import { Button } from '@/controls/Buttons';
import { SelectedNodeActions } from '@/controls/SelectedNodeActions';
import CssEditor, { makeCssEditorProps } from '@/editor/CssEditor';
import NodeTreeVisualizer from '@/editor/NodeTreeVisualizer';
import Tabs from '@/controls/Tabs';
import ResumeContextMenu from '@/controls/ResumeContextMenu';
import generateHtml from '@/editor/GenerateHtml';
import ComponentTypes from '@/shared/schema/ComponentTypes';
import { IdType, NodeProperty, ResumeSaveData, ResumeNode, EditorMode, Globals } from '@/types';
import ResumeContext from '@/shared/utils/ResumeContext';
import { createPortal } from 'react-dom';
import { SelectedNodeHighlightBox } from '@/editor/HighlightBox';
import SplitPane from 'react-split-pane';
import { useEditorStore } from '@/shared/stores/editorStore';
import { useResumeStore } from '@/shared/stores/resumeStore';
import { useHistoryStore, recordHistory } from '@/shared/stores/historyStore';

/** These props are only used for testing */
export interface ResumeProps {
    mode?: EditorMode;
    nodes?: Array<ResumeNode>;
    css?: CssNode;
    rootCss?: CssNode;
}

export interface ResumeState {
    css: CssNode;
    rootCss: CssNode;
    mode: EditorMode;

    activeTemplate?: string;
    clipboard?: ResumeNode;

    // TODO: Remove???
    hoverNode?: IdType;
}

class Resume extends React.Component<ResumeProps, ResumeState> {
    /** Stores IDs of nodes that were targeted by a single click */
    private clicked = new Array<IdType>();

    private css: CssNode;
    private rootCss: CssNode;
    private style = document.createElement("style");
    private verticalPaneRef = React.createRef<SplitPane>();
    private resumeRef = React.createRef<HTMLDivElement>();
    private unsubscribeStores?: () => void;

    constructor(props: ResumeProps) {
        super(props);

        // Custom CSS
        const head = document.getElementsByTagName("head")[0];
        head.appendChild(this.style);

        this.css = props.css || new CssNode("Resume CSS", {}, "#resume");
        this.rootCss = props.rootCss || new CssNode(":root", {}, ":root");
        
        // Initialize store with props if provided
        if (props.nodes) {
            useResumeStore.getState().setNodes(props.nodes);
        }
        
        this.state = {
            css: this.css,
            rootCss: this.rootCss,
            mode: props.mode || "landing"
        };

        this.handleClick = this.handleClick.bind(this);
        this.print = this.print.bind(this);
        this.toggleMode = this.toggleMode.bind(this);

        /** Resume Nodes */
        this.addCssClasses = this.addCssClasses.bind(this);
        this.addHtmlId = this.addHtmlId.bind(this);
        this.addChild = this.addChild.bind(this);
        this.updateData = this.updateData.bind(this);
        this.deleteSelected = this.deleteSelected.bind(this);
        this.updateSelected = this.updateSelected.bind(this);

        /** Templates and Styling **/
        this.loadTemplate = this.loadTemplate.bind(this);
        this.renderSidebar = this.renderSidebar.bind(this);
        this.renderCssEditor = this.renderCssEditor.bind(this);

        /** Load & Save */
        this.exportHtml = this.exportHtml.bind(this);
        this.loadData = this.loadData.bind(this);
        this.saveLocal = this.saveLocal.bind(this);
        this.saveFile = this.saveFile.bind(this);
    }

    /** Returns true if we are actively editing a resume */
    get isEditing(): boolean {
        return this.state.mode === 'normal'
            || this.state.mode === 'help';
    }

    get isPrinting(): boolean {
        return this.state.mode === 'printing';
    }

    /** Retrieve the selected node **/
    get selectedNode(): ResumeNode | undefined {
        const uuid = useEditorStore.getState().selectedNodeId;
        if (uuid) {
            return useResumeStore.getState().getNodeByUuid(uuid);
        }
        return undefined;
    }

    /** Return resume stylesheet */
    get stylesheet() {
        return `${this.state.rootCss.stylesheet()}\n\n${this.state.css.stylesheet()}`;
    }

    componentDidMount() {
        // Subscribe to store changes to trigger re-renders
        const unsubEditor = useEditorStore.subscribe(() => this.forceUpdate());
        const unsubResume = useResumeStore.subscribe(() => this.forceUpdate());
        const unsubHistory = useHistoryStore.subscribe(() => this.forceUpdate());
        
        this.unsubscribeStores = () => {
            unsubEditor();
            unsubResume();
            unsubHistory();
        };
    }

    componentWillUnmount() {
        if (this.unsubscribeStores) {
            this.unsubscribeStores();
        }
    }

    /**
     * Update stylesheets
     * @param prevProps
     */
    componentDidUpdate(_prevProps, prevState: ResumeState) {
        if (this.state.css !== prevState.css || this.state.rootCss !== prevState.css) {
            this.style.innerHTML = this.stylesheet;
        }
    }

    /**
     * Handles clicks on the resume
     * @param rightClick Whether or not the click was a right click
     */
    private handleClick(rightClick = false) {
        // We want to select the node with the longest ID, i.e.
        // the deepest node that was clicked
        let selectedId: IdType = [];
        this.clicked.forEach((id) => {
            if (id.length > selectedId.length) {
                selectedId = id;
            }
        });

        // Reset list of clicked nodes
        this.clicked = new Array<IdType>();

        const currentNode = useEditorStore.getState().selectedNodeId;
        const { editNode, selectNode } = useEditorStore.getState();
        const nodeToSelect = useResumeStore.getState().getNode(selectedId);
        
        if (!rightClick && nodeToSelect && currentNode === nodeToSelect.uuid) {
            // Double click on a node ==> edit the node
            editNode(nodeToSelect.uuid);
        }
        else if (nodeToSelect) {
            // Single click ==> select the node
            selectNode(nodeToSelect.uuid);
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
    loadTemplate(key = 'Integrity') {
        const template: ResumeSaveData = ResumeTemplates.templates[key];
        this.setState({ activeTemplate: key});
        this.loadData(template, 'changingTemplate');
    };

    private renderTemplateChanger() {
        const templateNames = Object.keys(ResumeTemplates.templates);
        return (
            <div id="template-selector">
                <PureMenu>
                    {templateNames.map((key: string) =>
                        <PureMenuItem key={key} onClick={() => this.loadTemplate(key)}>
                            <PureMenuLink>{key}</PureMenuLink>
                        </PureMenuItem>
                    )}
                </PureMenu>
                <Button onClick={() => this.toggleMode()}>Use this Template</Button>
            </div>
        );
    }
    //#endregion

    //#region Creating/Editing Nodes
    addHtmlId(htmlId: string) {
        const currentNode = this.selectedNode as ResumeNode;
        const uuid = useEditorStore.getState().selectedNodeId;
        if (currentNode && uuid) {
            let root = new CssNode(`#${htmlId}`, {}, `#${htmlId}`);
            let copyTree = this.css.findNode(
                ComponentTypes.cssName(currentNode.type)) as CssNode;

            if (copyTree) {
                root = copyTree.copySkeleton(`#${htmlId}`, `#${htmlId}`);
            }

            recordHistory();
            useResumeStore.getState().updateNodeByUuid(uuid, 'htmlId', htmlId);
            
            this.css.addNode(root);
            this.setState({
                css: this.css.deepCopy()
            });
        }
    }

    addCssClasses(classes: string) {
        const currentNode = this.selectedNode as ResumeNode;
        const uuid = useEditorStore.getState().selectedNodeId;
        if (currentNode && uuid) {
            recordHistory();
            useResumeStore.getState().updateNodeByUuid(uuid, 'classNames', classes);
        }
    }
    
    /**
     * Add node as a child to the node identified by UUID
     * @param parentUuid UUID of parent node, or undefined for root
     * @param node Node to be added
     */
    addChild(parentUuid: string | undefined, node: ResumeNode) {
        recordHistory();
        if (parentUuid) {
            useResumeStore.getState().addNodeByUuid(parentUuid, node);
        } else {
            // Add to root
            useResumeStore.getState().addNode([], node);
        }
    }

    deleteSelected() {
        const uuid = useEditorStore.getState().selectedNodeId;
        if (uuid) {
            recordHistory();
            useResumeStore.getState().deleteNodeByUuid(uuid);
            useEditorStore.getState().unselectNode();
        }
    }

    updateData(id: IdType, key: string, data: any) {
        recordHistory();
        useResumeStore.getState().updateNode(id, key, data);
    }

    updateSelected(key: string, data: NodeProperty) {
        const uuid = useEditorStore.getState().selectedNodeId;
        if (uuid) {
            recordHistory();
            useResumeStore.getState().updateNodeByUuid(uuid, key, data);
        }
    }

    get clipboardProps() {
        const copyClipboard = () => {
            if (this.selectedNode) {
                this.setState({ clipboard: deepCopy(this.selectedNode) });
            }
        };

        return {
            copyClipboard: copyClipboard,
            cutClipboard: () => {
                if (this.selectedNode) {
                    copyClipboard();
                    this.deleteSelected();
                }
            },
            pasteClipboard: this.state.clipboard as ResumeNode ? () => {
                // Default target: root UUID
                if (this.selectedNode) {
                    // UUIDs will be added in the method below
                    this.addChild(this.selectedNode.uuid, deepCopy(this.state.clipboard as ResumeNode));
                }
            } : undefined
        }
    }

    get undoRedoProps() {
        const { canUndo, canRedo, undo, redo } = useHistoryStore.getState();
        return {
            undo: canUndo() ? undo : undefined,
            redo: canRedo() ? redo : undefined
        };
    }

    get moveSelectedProps() {
        const uuid = useEditorStore.getState().selectedNodeId;
        if (!uuid) {
            return { moveUp: undefined, moveDown: undefined };
        }

        const tree = useResumeStore.getState().tree;
        const id = tree.getHierarchicalId(uuid);
        if (!id) {
            return { moveUp: undefined, moveDown: undefined };
        }

        const moveSelectedDownEnabled = !tree.isLastSibling(id);
        const moveSelectedUpEnabled = id[id.length - 1] > 0;

        return {
            moveUp: moveSelectedUpEnabled ?
                () => {
                    recordHistory();
                    const newUuid = useResumeStore.getState().moveNodeUpByUuid(uuid);
                    useEditorStore.getState().selectNode(newUuid);
                } :
                undefined,
            moveDown: moveSelectedDownEnabled ?
                () => {
                    recordHistory();
                    const newUuid = useResumeStore.getState().moveNodeDownByUuid(uuid);
                    useEditorStore.getState().selectNode(newUuid);
                } :
                undefined
        };
    }
    //#endregion
    
    //#region Serialization
    exportHtml() {
        // TODO: Make this user defineable
        const filename = 'resume.html';
        
        // Temporarily switch to print mode to get proper link rendering
        const prevState = { ...this.state };
        useEditorStore.getState().unselectNode();
        this.setState({
            mode: 'printing'
        });

        // Wait for render to complete before capturing HTML
        requestAnimationFrame(() => {
            let resumeHtml = this.resumeRef.current ? this.resumeRef.current.outerHTML : '';
            var blob = new Blob(
                [generateHtml(this.stylesheet, resumeHtml)],
                { type: "text/html;charset=utf-8" }
            );

            saveAs(blob, filename);
            
            // Restore previous state
            this.setState(prevState);
        });
    }

    loadData(data: object, mode: EditorMode = 'normal') {
        let savedData = data as ResumeSaveData;
        const nodes = assignIds(savedData.childNodes);
        useResumeStore.getState().setNodes(nodes);
        useHistoryStore.getState().clear(); // Clear history when loading new data
        
        this.css = CssNode.load(savedData.builtinCss);
        this.rootCss = CssNode.load(savedData.rootCss);

        this.setState({
            css: this.css.deepCopy(),
            mode: mode,
            rootCss: this.rootCss.deepCopy()
        })
    }

    loadLocal() {
        const savedData = localStorage.getItem(Globals.localStorageKey);
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
            childNodes: useResumeStore.getState().tree.childNodes,
            builtinCss: this.css.dump(),
            rootCss: this.rootCss.dump()
        };
    }

    saveLocal() {
        useResumeStore.getState().clearUnsavedChanges();
        localStorage.setItem('experiencer', JSON.stringify(this.dump()));
    }

    // Save data to an external file
    saveFile(filename: string) {
        saveAs(new Blob([JSON.stringify(this.dump())],
            { type: "text/plain;charset=utf-8" }), filename);
    }
    //#endregion

    //#region Helper Component Props
    private get selectedNodeActions() : SelectedNodeActions {
        return {
            ...this.clipboardProps,
            ...this.moveSelectedProps,
            delete: this.deleteSelected,
        }
    }

    private get topMenuProps(): TopNavBarProps {
        let props = {
            exportHtml: this.exportHtml,
            isEditing: this.isEditing,
            loadData: this.loadData,
            mode: this.state.mode,
            new: this.loadTemplate,
            print: this.print,
            saveLocal: this.saveLocal,
            saveFile: this.saveFile,
            toggleHelp: () => this.toggleMode('help'),
            toggleLanding: () => this.setState({ mode: 'landing' })
        }
                    
        return props;
    }

    private get editingBarProps() : EditingBarProps {
        return {
            ...this.undoRedoProps,
            ...this.selectedNodeActions,
            addHtmlId: this.addHtmlId,
            addCssClasses: this.addCssClasses,
            addChild: this.addChild,
            unselect: () => useEditorStore.getState().unselectNode(),
            updateSelected: this.updateSelected,
            saveLocal: useResumeStore.getState().unsavedChanges ? this.saveLocal : undefined
        }
    }

    private get resumeHotKeysProps() {
        return {
            ...this.selectedNodeActions,
            ...this.undoRedoProps,
            togglePrintMode: () => this.toggleMode('printing'),
            reset: () => {
                useEditorStore.getState().unselectNode();
                this.setState({
                    mode: 'normal'
                });
            }
        }
    }

    print() {
        requestAnimationFrame(() => {
            const prevState = { ...this.state };

            useEditorStore.getState().unselectNode();
            this.setState({
                mode: 'printing'
            });

            window.print();

            this.setState(prevState);
        });
    }
    //#endregion

    private renderSidebar() {
        let CssEditor = this.renderCssEditor;
        return <Tabs>
            <NodeTreeVisualizer key="Tree" childNodes={useResumeStore.getState().tree.childNodes}
                selectNode={(uuid) => useEditorStore.getState().selectNode(uuid)}
                selectedNode={useEditorStore.getState().selectedNodeId}
            />
            <CssEditor key="CSS" />
            <div key="Raw CSS">
                <pre>
                    <code>
                        {this.stylesheet}
                    </code>
                </pre>
            </div>
        </Tabs>
    }
    
    /** Gather all variable declarations in :root */
    makeCssEditorVarSuggestions(): Array<string> {
        let suggestions = new Array<string>();

        for (let k of this.rootCss.properties.keys()) {
            if (k.slice(0, 2) === '--') {
                suggestions.push(`var(${k})`);
            }
        }
        
        return suggestions;
    }

    private renderCssEditor() {
        const cssUpdateCallback = () => this.setState({ css: this.css.deepCopy() });
        const rootCssUpdateCallback = () => this.setState({ rootCss: this.rootCss.deepCopy() });

        if (this.selectedNode) {
            let generalCssEditor = <></>
            let specificCssEditor = <></>

            const rootNode = this.state.css.findNode(
                ComponentTypes.cssName(this.selectedNode.type)) as CssNode;
            if (rootNode) {
                generalCssEditor = <CssEditor
                    cssNode={new ReadonlyCssNode(rootNode)}
                    isOpen={true}
                    verticalSplitRef={this.verticalPaneRef}
                    {...makeCssEditorProps(this.css, cssUpdateCallback)}
                />
            }

            if (this.selectedNode.htmlId && this.state.css.findNode([`#${this.selectedNode.htmlId}`])) {
                const specificRoot = this.state.css.findNode([`#${this.selectedNode.htmlId}`]) as CssNode;
                specificCssEditor = <CssEditor cssNode={new ReadonlyCssNode(specificRoot)}
                    isOpen={true}
                    verticalSplitRef={this.verticalPaneRef}
                    {...makeCssEditorProps(this.css, cssUpdateCallback)} />
            }

            return <>
                {specificCssEditor}
                {generalCssEditor}
            </>
        }
 
        return <>
            <CssEditor
                cssNode={new ReadonlyCssNode(this.state.rootCss)}
                isOpen={true}
                verticalSplitRef={this.verticalPaneRef}
                {...makeCssEditorProps(this.rootCss, rootCssUpdateCallback)} />
            <CssEditor
                cssNode={new ReadonlyCssNode(this.state.css)}
                isOpen={true}
                verticalSplitRef={this.verticalPaneRef}
                varSuggestions={this.makeCssEditorVarSuggestions()}
                {...makeCssEditorProps(this.css, cssUpdateCallback)} />
        </>
    }

    render() {
        const hlBoxContainer = createContainer("hl-box-container");
        const resume = (
            <>
                <ContextMenuTrigger attributes={{ id: "resume-container" }}
                    id="resume-menu">
                    <div id="resume" ref={this.resumeRef}
                        onClick={() => this.handleClick()}
                        onContextMenu={() => this.handleClick(true)}>
                        <ResumeHotKeys {...this.resumeHotKeysProps} />
                        {useResumeStore.getState().tree.childNodes.map((elem, idx, arr) => {
                            const uniqueId = elem.uuid;
                            const props = {
                                ...elem,
                                updateResumeData: this.updateData,
                                index: idx,
                                numSiblings: arr.length
                            };

                            return (
                                <ResumeContext.Provider
                                    key={uniqueId}
                                    value={{
                                    isPrinting: this.isPrinting,
                                    updateClicked: (id: IdType) => { this.clicked.push(id) }
                                }}>
                                    <ResumeComponentFactory {...props} />
                                </ResumeContext.Provider>
                            );
                        })}
                    </div>

                <ResumeContextMenu
                    getNode={(uuid) => useResumeStore.getState().getNodeByUuid(uuid)}
                    getParentUuids={(uuid) => useResumeStore.getState().getParentUuids(uuid)}
                    currentId={useEditorStore.getState().selectedNodeId}
                    editSelected={() => {
                        const node = this.selectedNode;
                        if (node) {
                            useEditorStore.getState().editNode(node.uuid);
                        }
                    }}
                    updateSelected={this.updateSelected}
                    selectNode={(uuid) => useEditorStore.getState().selectNode(uuid)}
                />
                </ContextMenuTrigger>
                {createPortal(
                    <SelectedNodeHighlightBox 
                        verticalSplitRef={this.verticalPaneRef}
                    />,
                    hlBoxContainer
                )}
            </>
        );
        
        const editingTop = this.isPrinting ? <></> : (
            <header id="app-header" className="no-print">
                <TopNavBar {...this.topMenuProps} />
                {this.isEditing ? <TopEditingBar {...this.editingBarProps} /> : <></>}
            </header>
        );

        // Render the final layout based on editor mode
        switch (this.state.mode) {
            case 'help':
                return <ResizableSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    sidebar={<Help close={() => this.toggleMode()} />}
                />
            case 'changingTemplate':
                return <StaticSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    sidebar={this.renderTemplateChanger()}
                />
            case 'landing':
                return <DefaultLayout
                    topNav={editingTop}
                    main={<Landing
                        loadLocal={() => { this.loadLocal() }}
                        new={this.loadTemplate}
                        loadData={this.loadData}
                    />
                    } />
            case 'printing':
                return resume;
            default:
                return <ResizableSidebarLayout
                    ref={this.verticalPaneRef}
                    topNav={editingTop}
                    main={resume}
                    isPrinting={this.isPrinting}
                    sidebar={this.renderSidebar()}
            />
        }
    }
}

export default Resume;