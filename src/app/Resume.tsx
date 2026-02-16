import { saveAs } from 'file-saver';
import * as React from 'react';
import { createPortal } from 'react-dom';

import '@/assets/fonts/icofont.min.css';
import '@/shared/scss/index.scss';
import 'purecss/build/pure-min.css';

// Utilities
import { createContainer, deepCopy } from '@/shared/utils/Helpers';
import { printResume, exportResumeAsHtml } from '@/shared/utils/PrintHelpers';

// Components
import { Button } from '@/controls/Buttons';
import { ResizableSidebarLayout, StaticSidebarLayout, DefaultLayout } from '@/controls/Layouts';
import ResumeHotKeys from '@/controls/ResumeHotkeys';
import { SelectedNodeActions } from '@/controls/SelectedNodeActions';
import TopEditingBar, { EditingBarProps, TopEditingBarWrapperProps } from '@/controls/TopEditingBar';
import TopNavBar, { TopNavBarProps } from '@/controls/TopNavBar';
import Tabs from '@/controls/Tabs';
import PureMenu, { PureMenuLink, PureMenuItem } from '@/controls/menus/PureMenu';
import NodeTreeVisualizer from '@/editor/NodeTreeVisualizer';
import Help from '@/help/Help';
import Landing from '@/help/Landing';
import ResumeComponentFactory from '@/resume/ResumeComponent';
import ComponentTypes from '@/resume/schema/ComponentTypes';
import ResumeTemplates from '@/templates/ResumeTemplates';
import ResumeCssEditor from '@/app/ResumeCssEditor';

// Stores
import { useEditorStore, useMode, useSelectedNodeId, useIsEditingSelected } from '@/shared/stores/editorStore';
import { useHistoryStore, recordHistory } from '@/shared/stores/historyStore';
import { addCssClasses, useResumeStore } from '@/shared/stores/resumeStore';
import { useCssStore, useTreeStylesheet } from '@/shared/stores/cssStore';

// Types
import CssNode from '@/shared/utils/CssTree';
import { IdType, NodeProperty, ResumeSaveData, ResumeNode, EditorMode, Globals } from '@/types';
import useHandlePrint from '@/shared/hooks/useHandlePrint';
import useStylesheet from '@/shared/hooks/useStylesheet';
import { useEffect } from 'react';
import loadData, { loadLocal } from '@/shared/stores/loadData';
import useMoveSelectedProps from '@/shared/hooks/useMoveSelectedProps';
import deleteSelectedNode from '@/shared/stores/resumeStore/deleteSelectedNode';
import { saveFile, saveLocal } from '@/shared/stores/saveResume';
import addChildNode from '@/shared/stores/resumeStore/addChildNode';

// Dynamic imports (lazy-loaded on-demand)
const ResumeContextMenuConnected = React.lazy(
    () => import('@/controls/ResumeContextMenuConnected')
);
const SelectedNodeHighlightBox = React.lazy(
    () => import('@/editor/HighlightBox').then(m => ({ default: m.SelectedNodeHighlightBox }))
);

export interface ResumeProps {
    mode?: EditorMode;
    selectedNodeId?: string;
    isEditingSelected?: boolean;
    moveSelectedProps?: ReturnType<typeof useMoveSelectedProps>;
    nodes?: Array<ResumeNode>;
    css: CssNode;
    rootCss: CssNode;
    setCss: (css: CssNode) => void;
    setRootCss: (rootCss: CssNode) => void;
    stylesheet: string;
}

export type ResumeWrapperProps = Partial<Omit<ResumeProps, 'selectedNodeId' | 'isEditingSelected'>>;

export interface ResumeState {
    activeTemplate?: string;
    clipboard?: ResumeNode;
}

class Resume extends React.Component<ResumeProps, ResumeState> {
    private resumeRef = React.createRef<HTMLDivElement>();

    constructor(props: ResumeProps) {
        super(props);

        // Initialize stores with props if provided (unit tests only)
        if (props.nodes) {
            useResumeStore.getState().setNodes(props.nodes);
        }
        if (props.mode) {
            useEditorStore.getState().setMode(props.mode);
        }
        
        this.state = {};

        /** Resume Nodes */
        this.addHtmlId = this.addHtmlId.bind(this);
        this.updateData = this.updateData.bind(this);

        /** Templates and Styling **/
        this.loadTemplate = this.loadTemplate.bind(this);
        this.renderSidebar = this.renderSidebar.bind(this);

        /** Load & Save */
        this.exportHtml = this.exportHtml.bind(this);
    }

    /** Returns true if we are actively editing a resume */
    get isEditing(): boolean {
        const mode = this.props.mode || 'landing';
        return mode === 'normal' || mode === 'help';
    }

    /** Retrieve the selected node **/
    get selectedNode(): ResumeNode | undefined {
        const uuid = this.props.selectedNodeId;
        return uuid ? useResumeStore.getState().getNodeByUuid(uuid) : undefined;
    }

    //#region Changing Templates
    loadTemplate(key = 'Integrity') {
        const template: ResumeSaveData = ResumeTemplates.templates[key];
        this.setState({ activeTemplate: key});
        loadData(template, 'changingTemplate');
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
                <Button onClick={() => useEditorStore.getState().toggleMode('normal')}>Use this Template</Button>
            </div>
        );
    }
    //#endregion

    //#region Creating/Editing Nodes
    addHtmlId(htmlId: string) {
        const currentNode = this.selectedNode as ResumeNode;
        const uuid = useEditorStore.getState().selectedNodeId;
        if (currentNode && uuid) {
            const css = this.props.css;
            let root = new CssNode(`#${htmlId}`, {}, `#${htmlId}`);
            let copyTree = css.findNode(
                ComponentTypes.instance.cssName(currentNode.type)) as CssNode;

            if (copyTree) {
                root = copyTree.copySkeleton(`#${htmlId}`, `#${htmlId}`);
            }

            recordHistory();
            useResumeStore.getState().updateNodeByUuid(uuid, 'htmlId', htmlId);
            
            useCssStore.getState().updateCss((css) => {
                css.addNode(root);
            });
        }
    }

    updateData(id: IdType, key: string, data: any) {
        recordHistory();
        useResumeStore.getState().updateNode(id, key, data);
    }

    updateDataFields(id: IdType, patch: Partial<Record<string, NodeProperty>>) {
        recordHistory();
        Object.entries(patch).forEach(([key, value]) => {
            if (value !== undefined) {
                useResumeStore.getState().updateNode(id, key, value);
            }
        });
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
                    deleteSelectedNode(this.selectedNode.uuid);
                }
            },
            pasteClipboard: this.state.clipboard as ResumeNode ? () => {
                // Default target: root UUID
                if (this.selectedNode) {
                    // UUIDs will be added in the method below
                    addChildNode(this.selectedNode.uuid, deepCopy(this.state.clipboard as ResumeNode));
                }
            } : undefined
        }
    }
    //#endregion
    
    //#region Serialization
    exportHtml() {
        // TODO: Make this user defineable
        const filename = 'resume.html';
        exportResumeAsHtml(this.resumeRef.current, this.props.stylesheet ?? '', filename);
    }
    //#endregion

    //#region Helper Component Props
    private get selectedNodeActions() : SelectedNodeActions {
        return {
            ...this.clipboardProps,
            ...this.props.moveSelectedProps,
            delete: () => deleteSelectedNode(this.selectedNode?.uuid),
        }
    }

    private get topMenuProps(): TopNavBarProps {
        let props = {
            exportHtml: this.exportHtml,
            isEditing: this.isEditing,
            loadData: loadData,
            mode: this.props.mode || 'landing',
            new: this.loadTemplate,
            print: printResume,
            saveLocal: saveLocal,
            saveFile: saveFile,
            toggleHelp: () => useEditorStore.getState().toggleMode('help'),
            toggleLanding: () => useEditorStore.getState().setMode('landing')
        }
                    
        return props;
    }

    private get editingBarProps() : TopEditingBarWrapperProps {
        return {
            ...this.selectedNodeActions,
            addHtmlId: this.addHtmlId,
            addCssClasses: (classes) => addCssClasses(this.selectedNode, classes)
        }
    }

    private get resumeHotKeysProps() {
        return {
            ...this.selectedNodeActions
        }
    }
    //#endregion

    private renderSidebar() {
        return <Tabs>
            <NodeTreeVisualizer key="Tree" childNodes={useResumeStore.getState().tree.childNodes}
                selectNode={(uuid) => useEditorStore.getState().selectNode(uuid)}
                selectedNode={useEditorStore.getState().selectedNodeId}
            />
            <ResumeCssEditor key="CSS" />
            <div key="Raw CSS">
                <pre>
                    <code>
                        {this.props.stylesheet}
                    </code>
                </pre>
            </div>
        </Tabs>
    }

    render() {
        const { mode } = this.props;
        const hlBoxContainer = createContainer("hl-box-container");
        const resume = (
            <>
                <div id="resume" ref={this.resumeRef}>
                    <ResumeHotKeys {...this.resumeHotKeysProps} />
                    {useResumeStore.getState().tree.childNodes.map((elem, idx, arr) => {
                        const uniqueId = elem.uuid;
                        const props = {
                            ...elem,
                            updateResumeData: this.updateData,
                            updateResumeDataFields: this.updateDataFields,
                            index: idx,
                            numSiblings: arr.length
                        };

                        return (
                            <ResumeComponentFactory
                                key={uniqueId}
                                {...props}
                            />
                        );
                    })}
                </div>
                <React.Suspense fallback={null}>
                    <ResumeContextMenuConnected />
                </React.Suspense>
                {createPortal(
                    <React.Suspense fallback={null}>
                        <SelectedNodeHighlightBox />
                    </React.Suspense>,
                    hlBoxContainer
                )}
            </>
        );
        
        const editingTop = mode === 'printing' ? <></> : (
            <header id="app-header" className="no-print">
                <TopNavBar {...this.topMenuProps} />
                {this.isEditing ? <TopEditingBar {...this.editingBarProps} /> : <></>}
            </header>
        );

        // Render the final layout based on editor mode
        switch (mode) {
            case 'help':
                return <ResizableSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    sidebar={<Help close={() => useEditorStore.getState().toggleMode('help')} />}
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
                        loadLocal={() => { loadLocal() }}
                        new={this.loadTemplate}
                        loadData={loadData}
                    />
                    } />
            case 'printing':
                return resume;
            default:
                return <ResizableSidebarLayout
                    topNav={editingTop}
                    main={resume}
                    sidebar={this.renderSidebar()}
            />
        }
    }
}

/**
 * Functional wrapper that subscribes to mode and selection state.
 * Provides these as props to the Resume class component for selective re-rendering.
 */
function ResumeContainer(props: ResumeWrapperProps) {
    const { css, rootCss, setCss, setRootCss } = useCssStore();
    const stylesheet = useTreeStylesheet();
    const storeMode = useMode();
    const selectedNodeId = useSelectedNodeId();
    const isEditingSelected = useIsEditingSelected();
    
    // Use prop mode if provided (for tests), otherwise use store mode
    const mode = props.mode || storeMode;

    // Initialize stores with props if provided (unit tests only)
    useEffect(() => {
        if (props.css) {
            setCss(props.css);
        }
        if (props.rootCss) {
            setRootCss(props.rootCss);
        }
    }, []); // Run once on mount

    useHandlePrint();
    useStylesheet(stylesheet);
    const moveSelectedProps = useMoveSelectedProps();
    
    return <Resume 
        {...props}
        mode={mode}
        selectedNodeId={selectedNodeId}
        isEditingSelected={isEditingSelected}
        css={css}
        rootCss={rootCss}
        setCss={setCss}
        setRootCss={setRootCss}
        stylesheet={stylesheet}
        moveSelectedProps={moveSelectedProps}
    />
}

export default ResumeContainer;