import * as React from 'react';
import { saveAs } from 'file-saver';

import './css/index.css';
import './scss/custom.scss';
import 'react-quill/dist/quill.snow.css';

import ResumeComponent, { EditorMode } from './components/ResumeComponent';
import { assignIds, deepCopy, arraysEqual } from './components/Helpers';
import { SelectedNodeProps, AddChild, Action } from './components/ResumeNodeBase';
import ResumeTemplateProvider from './components/ResumeTemplateProvider';
import { ResizableSidebarLayout, StaticSidebarLayout, DefaultLayout } from './components/controls/Layouts';
import Landing from './components/help/Landing';
import TopNavBar from './components/controls/TopNavBar';
import ResumeHotKeys from './components/controls/ResumeHotkeys';
import ResumeState, { ResumeSaveData } from './components/controls/ResumeState';
import StyleEditor from './components/controls/StyleEditor';
import Help from './components/help/Help';
import { isNullOrUndefined } from 'util';
import HoverTracker, { IdType } from './components/utility/HoverTracker';
import TopEditingBar from './components/controls/TopEditingBar';
import ResumeNodeTree from './components/utility/NodeTree';
import { Button, Paper, Theme, makeStyles, createStyles, styled, Toolbar } from '@material-ui/core';
import CssNode from './components/utility/CssTree';

let defaultCss = new CssNode('Basics', {});
defaultCss.add(new CssNode(
    'Body', {
        'font-family': 'Georgia, serif',
        'font-size': '10pt'
    }, 'body'
));

let sectionCss = defaultCss.add(new CssNode('Sections', {}, 'section'));
sectionCss.add(new CssNode(
    'Section Contents', {
        'padding': '1em'
    }, '.entry-content'
));

console.log(defaultCss.stylesheet());

class Resume extends React.Component<{}, ResumeState> {
    hovering: HoverTracker;
    nodes: ResumeNodeTree;
    css: CssNode;
    style: HTMLStyleElement;
    unselect: Action;

    constructor(props) {
        super(props);

        // Custom CSS
        const head = document.getElementsByTagName("head")[0];
        this.style = document.createElement("style");
        this.style.innerHTML = "";
        head.appendChild(this.style);

        this.css = defaultCss;
        this.hovering = new HoverTracker();
        this.nodes = new ResumeNodeTree();
        this.state = {
            children: [],
            css: "",
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
        this.updateNestedChild = this.updateNestedChild.bind(this);

        /** Templates and Styling **/
        this.changeTemplate = this.changeTemplate.bind(this);
        this.renderStyle = this.renderStyle.bind(this);

        /** Load & Save */
        this.loadData = this.loadData.bind(this);
        this.saveFile = this.saveFile.bind(this);

        /** Cut & Paste */
        this.copyClipboard = this.copyClipboard.bind(this);
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
                return this.state.selectedNode ? uuid === this.state.selectedNode.uuid : false;
            },

            // Update the selected node
            updateSelected: (data?: SelectedNodeProps) => {
                this.setState({ selectedNode: data });
            },

            unselect: this.unselect
        }
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
    childMapper(elem: object, idx: number, arr: object[]) {
        const uniqueId = elem['uuid'];
        const props = {
            ...elem,
            uuid: uniqueId,
            mode: this.state.mode,
            addChild: this.addNestedChild.bind(this),
            moveUp: this.moveNestedUp.bind(this),
            moveDown: this.moveNestedDown.bind(this),
            deleteChild: this.deleteNested.bind(this),
            toggleEdit: this.toggleNestedEdit.bind(this),
            updateData: this.updateNestedChild,
            ...this.hoverProps,

            index: idx,
            numChildren: arr.length
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
    }

    renderTemplateChanger() {
        const loadTemplate = (key: string) => {
            this.setState({
                activeTemplate: key,
                ...ResumeTemplateProvider.templates[key]()
            });

            // TODO: Clean up this code
            this.nodes.children = ResumeTemplateProvider.templates[key]()['children'];

            // Update loaded CSS
            this.renderStyle();
        };

        const templateNames = Object.keys(ResumeTemplateProvider.templates);
        let navItems = templateNames.map((key: string) =>
            <nav key={key}>
                <a onClick={() => loadTemplate(key)}>
                    {key}
                </a>
            </nav>);

        return <div className="ml-2 mr-2 mt-2 mb-2" style={{ maxWidth: "300px", width: "30%" }}>
            <nav 
                className="flex-column mb-2">
                {navItems}
            </nav>
            <Button onClick={() => this.toggleMode()}>Use this Template</Button>
        </div>
    }
    //#endregion

    //#region Creating/Editing Nodes
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

    /**
     * Add an immediate child
     * @param node Node to be added
     */
    addChild(node: object) {
        this.nodes.addChild(assignIds(node));
        this.setState({ children: this.nodes.children });
    }

    /**
     * Add node as a child to the node identified by id
     * @param id   Hierarchical id pointing to some node
     * @param node Node to be added
     */
    addNestedChild(id: IdType, node: object) {
        this.nodes.addNestedChild(id, node);
        this.setState({ children: this.nodes.children });
    }

    deleteNested(id: IdType) {
        const deletedNode = this.nodes.getNodeById(id);
        this.nodes.deleteChild(id);
        this.setState({ children: this.nodes.children });

        // If node to be deleted is selected, unset
        // selected node data to avoid memory leaks
        const selectedNode = this.state.selectedNode as SelectedNodeProps;
        if (selectedNode as SelectedNodeProps) {
            if (selectedNode.uuid == deletedNode['uuid']) {
                this.hovering.hoverOut(selectedNode.id);
                this.setState({
                    selectedNode: undefined,
                    hoverNode: this.hovering.currentId
                });
            }
        }
    }

    updateNestedChild(id: IdType, key: string, data: any) {
        this.nodes.updateChild(id, key, data);
        this.setState({ children: this.nodes.children });
    }

    toggleNestedEdit(id: IdType) {
        this.nodes.toggleEdit(id);
        this.setState({ children: this.nodes.children });
    }

    moveNestedUp(id: IdType) {
        this.nodes.moveUp(id);
        this.setState({ children: this.nodes.children });
    }

    moveNestedDown(id: IdType) {
        this.nodes.moveDown(id);
        this.setState({ children: this.nodes.children });
    }
    //#endregion

    //#region Clipboard
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

            // UUIDs will be added in the method below
            (this.state.selectedNode.addChild as AddChild)(this.state.selectedNode.id, node);
        }
    }
    //#endregion
    
    //#region Serialization
    loadData(data: object) {
        let savedData = data as ResumeSaveData;
        this.nodes.children = assignIds(savedData.children) as Array<object>;

        this.setState({
            children: this.nodes.children,
            css: savedData.css as string,
            mode: 'normal'
        });

        // Actually load custom CSS
        this.renderStyle();
    }

    // Save data to an external file
    saveFile(filename: string) {
        const data: ResumeSaveData = {
            children: this.state.children,
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
    get toolbarProps() {
        const pasteEnabled = this.isNodeSelected && !isNullOrUndefined(this.state.clipboard);

        let props = {
            mode: this.state.mode,
            loadData: this.loadData,
            saveFile: this.saveFile,
            changeTemplate: this.changeTemplate,
            toggleHelp: () => this.toggleMode('help'),
            toggleLanding: () => this.setState({ mode: 'landing' }),
            toggleStyleEditor: () => this.toggleMode('editingStyle')
        }

        if (this.isNodeSelected) {
            props['copyClipboard'] = this.copyClipboard;
            props['unselect'] = this.unselect;
        }

        if (pasteEnabled) {
            props['pasteClipboard'] = this.pasteClipboard;
        }

        return props;
    }

    get resumeHotKeysProps() {
        return {
            copyClipboard: this.copyClipboard,
            pasteClipboard: this.pasteClipboard,
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

    //#endregion

    render() {
        const resumeToolbar = this.isEditable ? <Toolbar>
            <Button variant="outlined" onClick={this.addSection}>Add Section</Button>
            <Button variant="outlined" onClick={this.addColumn}>Add Multi-Column Row</Button>
        </Toolbar> : <></>

        const MyPaper = styled(Paper)({
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '0.5in',
            width: '8.5in'
        });

        const resume = <div id="resume" className={this.resumeClassName}>
            <ResumeHotKeys {...this.resumeHotKeysProps} {...this.state} />
            {this.state.children.map(this.childMapper)}

            {resumeToolbar}
        </div>

        const topNav = <TopNavBar {...this.toolbarProps} />

        let main = resume;
        let sidebar: JSX.Element;

        const topEditingBar = this.state.selectedNode ? <TopEditingBar {...this.state.selectedNode} /> : <></>
        
        const editingTop = <>
            {topNav}
            {topEditingBar}
        </>

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
                    topNav={topNav}
                    main={resume}
                    sideBar={this.renderTemplateChanger()}
                />
            case 'landing':
                main = <Landing className={this.resumeClassName} />
                return <DefaultLayout
                    topNav={topNav}
                    main={main} />
            default:
                return <DefaultLayout
                    topNav={editingTop}
                    main={main} />
        }
    }
}

export default Resume;