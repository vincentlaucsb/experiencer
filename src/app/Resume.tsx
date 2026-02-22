import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRef, useCallback } from 'react';

import '@/assets/fonts/icofont.min.css';
import '@/shared/scss/index.scss';
import 'purecss/build/pure-min.css';

// Utilities
import { createContainer } from '@/shared/utils/Helpers';
import { exportResumeAsHtml } from '@/shared/utils/PrintHelpers';

// Components
import { Button } from '@/controls/Buttons';
import { ResizableSidebarLayout, StaticSidebarLayout, DefaultLayout } from '@/controls/Layouts';
import ResumeHotKeys from '@/controls/ResumeHotkeys';
import TopEditingBar from '@/controls/TopEditingBar';
import TopNavBar, { TopNavBarWrapperProps } from '@/controls/TopNavBar';
import Tabs from '@/controls/Tabs';
import PureMenu, { PureMenuLink, PureMenuItem } from '@/controls/menus/PureMenu';
import NodeTreeVisualizer from '@/editor/NodeTreeVisualizer';
import Help from '@/help/Help';
import Landing from '@/help/Landing';
import ResumeComponentFactory from '@/resume/ResumeComponent';
import ResumeTemplates from '@/templates/ResumeTemplates';
import ResumeCssEditor from '@/app/ResumeCssEditor';

// Stores
import { useEditorStore, useMode, useSelectedNodeId, useIsEditingSelected } from '@/shared/stores/editorStore';
import { recordHistory } from '@/shared/stores/historyStore';
import { useResumeTree, useResumeActions, resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useCssStore, useTreeStylesheet } from '@/shared/stores/cssStore';

// Types
import CssNode from '@/shared/CssTree';
import { IdType, NodeProperty, ResumeSaveData, ResumeNode, EditorMode, Globals } from '@/types';
import useHandlePrint from '@/shared/hooks/useHandlePrint';
import useStylesheet from '@/shared/hooks/useStylesheet';
import { useEffect } from 'react';
import loadData, { loadLocal } from '@/shared/stores/loadData';

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
    nodes?: Array<ResumeNode>;
    css: CssNode;
    rootCss: CssNode;
    setCss: (css: CssNode) => void;
    setRootCss: (rootCss: CssNode) => void;
    stylesheet: string;
    tree: ResumeNode;
}

export type ResumeWrapperProps = Partial<Omit<ResumeProps, 'selectedNodeId' | 'isEditingSelected'>>;

function Resume(props: ResumeProps) {
    const resumeRef = useRef<HTMLDivElement>(null);
    const resumeNodes = props.tree.childNodes || [];
    useEffect(() => {
        console.log("Nodes", resumeNodes);
    }, [resumeNodes]);

    // Returns true if we are actively editing a resume
    const isEditing = (() => {
        const mode = props.mode || 'landing';
        return mode === 'normal' || mode === 'help';
    })();

    // Change Templates
    const loadTemplate = useCallback((key = 'Integrity') => {
        const template: ResumeSaveData = ResumeTemplates.templates[key];
        loadData(template, 'changingTemplate');
    }, []);

    const renderTemplateChanger = () => {
        const templateNames = Object.keys(ResumeTemplates.templates);
        return (
            <div id="template-selector">
                <PureMenu>
                    {templateNames.map((key: string) =>
                        <PureMenuItem key={key} onClick={() => loadTemplate(key)}>
                            <PureMenuLink>{key}</PureMenuLink>
                        </PureMenuItem>
                    )}
                </PureMenu>
                <Button onClick={() => useEditorStore.getState().toggleMode('normal')}>Use this Template</Button>
            </div>
        );
    };

    // Creating/Editing Nodes
    const updateData = useCallback((id: IdType, key: string, data: any) => {
        recordHistory();
        resumeNodeStore.updateNode(id, key, data);
    }, []);

    const updateDataFields = useCallback((id: IdType, patch: Partial<Record<string, NodeProperty>>) => {
        recordHistory();
        Object.entries(patch).forEach(([key, value]) => {
            if (value !== undefined) {
                resumeNodeStore.updateNode(id, key, value);
            }
        });
    }, []);

    // Serialization
    const exportHtml = useCallback(() => {
        // TODO: Make this user defineable
        const filename = 'resume.html';
        exportResumeAsHtml(resumeRef.current, props.stylesheet ?? '', filename);
    }, [props.stylesheet]);

    // Helper Component Props
    const topMenuProps: TopNavBarWrapperProps = {
        exportHtml: exportHtml,
        new: loadTemplate
    };

    const renderSidebar = () => {
        return <Tabs>
            <NodeTreeVisualizer key="Tree" childNodes={resumeNodes}
                selectNode={(uuid) => useEditorStore.getState().selectNode(uuid)}
                selectedNode={useEditorStore.getState().selectedNodeId}
            />
            <ResumeCssEditor key="CSS" />
            <div key="Raw CSS">
                <pre>
                    <code>
                        {props.stylesheet}
                    </code>
                </pre>
            </div>
        </Tabs>
    };

    // Main Render Logic
    const { mode } = props;
    const hlBoxContainer = createContainer("hl-box-container");
    const resume = (
        <>
            <div id="resume" ref={resumeRef}>
                <ResumeHotKeys />
                {resumeNodes.map((elem, idx, arr) => {
                    const uniqueId = elem.uuid;
                    const elementProps = {
                        ...elem,
                        updateResumeData: updateData,
                        updateResumeDataFields: updateDataFields,
                        index: idx,
                        numSiblings: arr.length
                    };

                    console.log("Rendering node", JSON.stringify(elementProps));

                    return (
                        <ResumeComponentFactory
                            key={uniqueId}
                            {...elementProps}
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
            <TopNavBar {...topMenuProps} />
            {isEditing ? <TopEditingBar /> : <></>}
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
                sidebar={renderTemplateChanger()}
            />
        case 'landing':
            return <DefaultLayout
                topNav={editingTop}
                main={<Landing
                    loadLocal={() => { loadLocal() }}
                    new={loadTemplate}
                    loadData={loadData}
                />
                } />
        case 'printing':
            return resume;
        default:
            return <ResizableSidebarLayout
                topNav={editingTop}
                main={resume}
                sidebar={renderSidebar()}
            />
    }
}

/**
 * Functional wrapper that subscribes to mode and selection state.
 * Provides these as props to the Resume component for selective re-rendering.
 */
function ResumeContainer(props: ResumeWrapperProps) {
    const { css, rootCss, setCss, setRootCss } = useCssStore();
    const stylesheet = useTreeStylesheet();
    const storeMode = useMode();
    const selectedNodeId = useSelectedNodeId();
    const isEditingSelected = useIsEditingSelected();
    const tree = useResumeTree();
    
    useEffect(() => {
        console.log("Tree changed", tree);
    }, [tree]);
    
    // Use prop mode if provided (for tests), otherwise use store mode
    const mode = props.mode || storeMode;

    // Initialize stores with props if provided (unit tests only)
    useEffect(() => {
        if (props.nodes) {
            resumeNodeStore.setNodes(props.nodes);
        }
        if (props.mode) {
            useEditorStore.getState().setMode(props.mode);
        }
        if (props.css) {
            setCss(props.css);
        }
        if (props.rootCss) {
            setRootCss(props.rootCss);
        }
    }, []); // Run once on mount

    useHandlePrint();
    useStylesheet(stylesheet);
    
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
        tree={tree}
    />
}

export default ResumeContainer;