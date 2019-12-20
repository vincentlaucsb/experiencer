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
import { isNullOrUndefined } from 'util';
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
import getDefaultCss from './components/templates/CssTemplates';

class Resume extends React.Component<{}, ResumeState> {
    hovering: HoverTracker;
    nodes: ResumeNodeTree;
    css: CssNode;

    /** Additional CSS */
    style: HTMLStyleElement;

    /** Base CSS */
    style2: HTMLStyleElement;
    unselect: Action;

    constructor(props) {
        super(props);

        // Custom CSS
        const head = document.getElementsByTagName("head")[0];
        this.style = document.createElement("style");
        this.style.innerHTML = "";
        head.appendChild(this.style);

        this.css = getDefaultCss();
        this.style2 = document.createElement("style");
        this.style2.innerHTML = this.css.stylesheet();
        head.appendChild(this.style2);

        this.hovering = new HoverTracker();
        this.nodes = new ResumeNodeTree();
        this.state = {
            builtinCss: this.css,
            children: [],
            css: "",
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
        this.childMapper = this.childMapper.bind(this);
        this.updateNestedChild = this.updateNestedChild.bind(this);

        /** Templates and Styling **/
        this.changeTemplate = this.changeTemplate.bind(this);
        this.renderStyle = this.renderStyle.bind(this);

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
            this.setSelectedNode(undefined);
        };
    }
    

    /** Prevent component from being edited from the template changing screen */
    get isEditable(): boolean {
        return !this.isPrinting && !(this.state.mode === 'changingTemplate');
    }

    get isNodeSelected() : boolean {
        return !isNullOrUndefined(this.state.selectedNode);
    }

    get isPrinting(): boolean {
        return this.state.mode === 'printing';
    }

    get resumeClassName() {
        if (this.isPrinting) {
            return "resume-printing";
        }

        let classNames = ["ml-auto", "mr-auto", "mt-2"];
        return classNames.join(' ');
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
                this.setSelectedNode(id);
            },

            unselect: this.unselect
        }
    }

    /** Retrieve the selected node **/
    get selectedNode() {
        if (this.state.selectedNode) {
            return this.nodes.getNodeById(this.state.selectedNode);
        }

        return;
    }

    setSelectedNode(id?: IdType) {
        // If the previously selected node was editing, bring it
        // out of an editing state
        if (this.selectedNode) {
            (this.selectedNode as ResumeNodeProps).isEditing = false;
        }

        this.setState({ selectedNode: id });
    }

    // Push style changes to browser
    renderStyle() {
        this.style.innerHTML = this.state.css;
    }

    /**
     * Render the nodes of this resume
     * @param elem An object with resume component data
     * @param idx  Index of the object
     * @param arr  Array of component data
     */
    childMapper(elem: ResumeNode, idx: number, arr: ResumeNode[]) {
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
        const key = 'Traditional 1';
        const template = ResumeTemplateProvider.templates[key]();

        this.setState({
            activeTemplate: key,
            mode: 'changingTemplate',
            ...template
        });

        this.style.innerHTML = template.css;
        this.style2.innerHTML = template.builtinCss.stylesheet();
    }

    renderTemplateChanger() {
        const loadTemplate = (key: string) => {
            const template = ResumeTemplateProvider.templates[key]();

            this.setState({
                activeTemplate: key,
                ...template
            });

            // TODO: Clean up this code
            this.nodes.children = template['children'];
            this.css = template['builtinCss'];

            // Update loaded CSS
            this.style.innerHTML = template.css;
            this.style2.innerHTML = template.builtinCss.stylesheet();
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
                ComponentTypes.cssName(currentNode.type)
            ) as CssNode;

            if (copyTree) {
                root = copyTree.copySkeleton(`#${htmlId}`, `#${htmlId}`);
            }

            this.updateSelected('cssId', htmlId);
            this.css.add(root);

            this.setState({
                builtinCss: this.css,
                children: this.nodes.children
            });
        }
    }

    addSection() {
        this.addChild({
            type: Section.name,
            headerPosition: this.state.sectionTitlePosition
        });
    }

    addColumn() {
        this.addChild(ComponentTypes.defaultValue(Row.name).node);
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
            this.setState({ children: this.nodes.children });

            // Unset selected node data
            this.hovering.hoverOut(id);
            this.setState({ hoverNode: this.hovering.currentId });
            this.setSelectedNode(undefined);
    }
    }

    // TODO: Do we still need this???
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
            const newId = this.nodes.moveUp(id);
            this.setState({ children: this.nodes.children, });
            this.setSelectedNode(newId);
        }
    }

    get moveSelectedDownEnabled() {
        const id = this.state.selectedNode as IdType;
        return id && !this.nodes.isLastSibling(id);
    }

    moveSelectedDown() {
        const id = this.state.selectedNode as IdType;
        if (this.moveSelectedDownEnabled) {
            const newId = this.nodes.moveDown(id);
            this.setState({ children: this.nodes.children });
            this.setSelectedNode(newId);
        }
    }
    //#endregion

    //#region Clipboard
    /** Copy the currently selected node */
    copyClipboard() {
        if (this.selectedNode) {
            const data = deepCopy(this.selectedNode);
            this.setState({
                clipboard: data
            });
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
            let node = deepCopy(this.state.clipboard);

            // UUIDs will be added in the method below
            this.addNestedChild(this.state.selectedNode as IdType, node);
        }
    }
    //#endregion
    
    //#region Serialization
    loadData(data: object) {
        let savedData = data as ResumeSaveData;
        this.nodes.children = assignIds(savedData.children);
        
        // Load built-in CSS
        this.css = CssNode.load(savedData.builtinCss);
        this.style2.innerHTML = this.css.stylesheet();
        this.setState({
            builtinCss: this.css,
            children: this.nodes.children,
            css: savedData.css as string,
            mode: 'normal'
        })

        // Actually load custom CSS
        this.renderStyle();
    }

    // Save data to an external file
    saveFile(filename: string) {
        const data: ResumeSaveData = {
            children: this.state.children,
            builtinCss: this.css.dump(),
            css: this.state.css
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
            toggleLanding: () => this.setState({ mode: 'landing' }),
            toggleStyleEditor: () => this.toggleMode('editingStyle')
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

    get styleEditorProps() {
        const onStyleChange = (css: string) => {
            this.setState({ css: css });
        }
        const toggleStyleEditor = () => this.toggleMode('editingStyle');

        return {
            onStyleChange: onStyleChange,
            renderStyle: this.renderStyle,
            toggleStyleEditor: toggleStyleEditor,
            ...this.state
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

    renderCssEditor() {
        if (this.selectedNode) {
            const rootNode = this.state.builtinCss.findNode(
                ComponentTypes.cssName(this.selectedNode.type)) as CssNode;

            let specificCssEditor = <></>
            if (this.selectedNode.cssId && this.state.builtinCss.findNode([`#${this.selectedNode.cssId}`])) {
                const specificRoot = this.state.builtinCss.findNode([`#${this.selectedNode.cssId}`]) as CssNode;
                specificCssEditor = <CssEditor isPrinting={this.isPrinting}
                    root={specificRoot}
                    updateData={(path, data) => {
                        this.css.setProperties(path, data);
                        this.setState({ builtinCss: this.css })
                        this.style2.innerHTML = this.css.stylesheet();
                    }}
                />
            }

            if (rootNode) {
                return <>
                    {specificCssEditor}
                    <CssEditor isPrinting={this.isPrinting}
                    root={rootNode}
                    updateData={(path, data) => {
                        this.css.setProperties(path, data);
                        this.setState({ builtinCss: this.css })
                        this.style2.innerHTML = this.css.stylesheet();
                    }}
                    />
                </>
            }

            return <></>
        }
                
        return <CssEditor isPrinting={this.isPrinting}
            root={this.state.builtinCss}
            updateData={(path, data) => {
                this.css.setProperties(path, data);
                this.setState({
                    builtinCss: this.css
                })

                this.style2.innerHTML = this.css.stylesheet();
            }}
        />
    }

    render() {
        // TODO: Make this moar better
        const Toolbar = (props: any) => {
           return <>{props.children}</>
        };

        const resumeToolbar = this.isEditable ? <Toolbar>
            <Button onClick={this.addSection}>Add Section</Button>
            <Button onClick={this.addColumn}>Add Multi-Column Row</Button>
        </Toolbar> : <></>

        const resume = <div id="resume" className={this.resumeClassName}>
            <ResumeHotKeys {...this.resumeHotKeysProps} />
            {this.state.children.map(this.childMapper)}

            {resumeToolbar}
        </div>

        let main = resume;
        let sidebar: JSX.Element;

        const topEditingBar = this.state.selectedNode ? <TopEditingBar {...this.editingBarProps as EditingBarProps} /> : <div id="toolbar"
            className="no-print">
            <Button><Octicon icon={Home} />Home</Button>
            <Button onClick={this.changeTemplate}>New</Button>
            <FileLoader loadData={this.loadData} />
            <FileSaver saveFile={this.saveFile} />
            <Button onClick={this.print}>Print</Button>
        </div>
        
        const editingTop = <RenderIf render={!this.isPrinting}>
            <header id="app-header" className="no-print">
                <TopNavBar {...this.toolbarProps} />
                {topEditingBar}
            </header>
        </RenderIf>

        // Render the final layout based on editor mode
        switch (this.state.mode) {
            case 'editingStyle':
            case 'help':
                if (this.state.mode === 'editingStyle') {
                    sidebar = <StyleEditor {...this.styleEditorProps} />
                }
                else {
                    sidebar = <Help close={() => this.toggleMode()} />
                }

                return <ResizableSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    sideBar={sidebar}
                />
            case 'changingTemplate':
                return <StaticSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    sideBar={this.renderTemplateChanger()}
                />
            case 'landing':
                main = <Landing className={this.resumeClassName} />
                return <DefaultLayout
                    topNav={editingTop}
                    main={main} />
            default:
                /**
                return <DefaultLayout
                    topNav={editingTop}
                    main={main} />
                    */
                return <StaticSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    isPrinting={this.isPrinting}
                    sideBar={this.renderCssEditor()}
            />
        }
    }
}

export default Resume;