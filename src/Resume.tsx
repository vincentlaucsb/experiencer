import * as React from 'react';
import { saveAs } from 'file-saver';

import 'purecss/build/pure-min.css';
import 'react-quill/dist/quill.snow.css';
import './scss/index.scss';

import ResumeComponent, { EditorMode } from './components/ResumeComponent';
import { assignIds, deepCopy, arraysEqual } from './components/Helpers';
import { AddChild, Action, CustomToolbarOptions } from './components/ResumeNodeBase';
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
import TopEditingBar, { EditingBarProps } from './components/controls/TopEditingBar';
import ResumeNodeTree from './components/utility/NodeTree';
import CssNode from './components/utility/CssTree';
import PureMenu, { PureMenuLink, PureMenuItem } from './components/controls/PureMenu';
import { Button } from './components/controls/Buttons';
import Octicon, { DesktopDownload, Home } from "@primer/octicons-react";
import { RenderIf } from './components/controls/HelperComponents';
import Row, { Column } from './components/FlexibleRow';
import FileLoader from './components/controls/FileLoader';
import FileSaver from './components/controls/FileSaver';
import { SelectedNodeActions } from './components/controls/SelectedNodeActions';
import CssEditor from './components/utility/CssEditor';
import MappedTextFields from './components/controls/inputs/MappedTextFields';

let defaultCss = new CssNode('Basics', {
    'font-family': 'Georgia, serif',
    'font-size': '10pt'
}, '#resume');

defaultCss.add(new CssNode('Links', {
    'color': '#000000'
}, 'a, a:hover'));

let headerCss = defaultCss.add(new CssNode('Header', {
    'margin-bottom': '16px'
}, 'header'));

let listCss = defaultCss.add(new CssNode('Lists', {
    'padding-left': '1.5em' /** Reduced padding */
}, 'ul'));

listCss.add(new CssNode('List Item', {
    'list-style-type': 'square' /** Default: circle */
}, 'li'));

let sectionCss = defaultCss.add(new CssNode('Sections', {
    'margin-bottom': '16px'
}, 'section'));

sectionCss.add(new CssNode(
    'Section Contents', {
        'margin-top': '8px',
        'margin-left': '8px',
        'padding-left': '16px',
        'padding-right': '8px',
        'border-left': '3px dotted #dddddd',
    }, '.entry-content'
));

let sectionTitle = defaultCss.add(new CssNode('Section Titles', {
    'font-family': 'Verdana, sans-serif',
    'font-weight': 'bold',
    'font-size': '15pt',
    'text-transform': 'uppercase'
}, 'h2'));

let entryCss = sectionCss.add(new CssNode('Entries',
    {
        'margin-bottom': '15px'
    }, '.entry'));

let entryTitleCss = sectionCss.add(new CssNode('Entry Titles',
    {
        'margin-bottom': '4px'
    }, '.entry-title'));

let entryTitleHeadingCss = entryTitleCss.add(new CssNode('Entry Title Headings', {
    'font-size': '13pt',
    'font-weight': 'bold'
}, 'h3'));

entryTitleHeadingCss.add(new CssNode('Title', {
    'content': "','",
    'padding-right': '0.33em'
}, '.title-text::after'))

entryTitleHeadingCss.add(new CssNode('Entry Title Headings ...', {
   'font-weight': 'normal'
}, '.extra-field'));

entryTitleCss.add(new CssNode('Entry Subtitles', {
    'font-family': 'Verdana, sans-serif',
}, '.subtitle'));

console.log(defaultCss.stylesheet());

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

        this.css = defaultCss;
        this.style2 = document.createElement("style");
        this.style2.innerHTML = this.css.stylesheet();
        head.appendChild(this.style2);

        this.hovering = new HoverTracker();
        this.nodes = new ResumeNodeTree();
        this.state = {
            children: [],
            css: "",
            mode: "landing",
            sectionTitlePosition: "top"
        };

        this.renderStyle();

        this.print = this.print.bind(this);
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

        this.editSelected = this.editSelected.bind(this);
        this.deleteSelected = this.deleteSelected.bind(this);
        this.moveSelectedUp = this.moveSelectedUp.bind(this);
        this.moveSelectedDown = this.moveSelectedDown.bind(this);

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
        this.setState({
            selectedNode: id,
            selectedNodeCustomOptions: undefined
        });
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
            moveUp: this.moveSelectedUp.bind(this),
            moveDown: this.moveSelectedDown.bind(this),
            deleteChild: this.deleteSelected.bind(this),
            toggleEdit: this.editSelected.bind(this),
            updateData: this.updateNestedChild,
            updateCustomOptions: this.updateCustomOptions.bind(this),
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
            const template = ResumeTemplateProvider.templates[key]();

            this.setState({
                activeTemplate: key,
                ...template
            });

            // TODO: Clean up this code
            this.nodes.children = template['children'];

            // Update loaded CSS
            this.renderStyle();
        };

        const templateNames = Object.keys(ResumeTemplateProvider.templates);
        let navItems = templateNames.map((key: string) =>
            <PureMenuItem onClick={() => loadTemplate(key)}>
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
    addSection() {
        this.addChild({
            type: 'Section',
            headerPosition: this.state.sectionTitlePosition
        });
    }

    addColumn() {
        this.addChild({
            type: Row.name,
            children: [
                { type: Column.name },
                { type: Column.name }
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

    updateNestedChild(id: IdType, key: string, data: any) {
        this.nodes.updateChild(id, key, data);
        this.setState({ children: this.nodes.children });
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

    updateCustomOptions(options: CustomToolbarOptions) {
        this.setState({ selectedNodeCustomOptions: options });
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
            customOptions: this.state.selectedNodeCustomOptions,
            id: this.state.selectedNode,

            // TODO: Fix this type cast
            type: this.selectedNode ? this.selectedNode['type'] : '',
            addChild: this.addNestedChild,
            toggleEdit: this.editSelected,
            moveUpEnabled: this.moveSelectedUpEnabled,
            moveDownEnabled: this.moveSelectedDownEnabled,
            unselect: this.unselect
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
                    sideBar={<CssEditor path={[]}
                        isPrinting={this.isPrinting}
                        root={this.css}
                        updateParentData={(css: CssNode) => {
                            this.css = css;
                            this.style2.innerHTML = this.css.stylesheet();
                            // this.setState({ css: this.css });
                        }}
                    />}
            />
        }
    }
}

export default Resume;