import * as React from 'react';

import { Button } from '@/controls/Buttons';
import { StaticSidebarLayout } from '@/controls/Layouts';
import PureMenu, { PureMenuLink, PureMenuItem } from '@/controls/menus/PureMenu';
import { ResumePreviewFrame } from '@/resume/ResumePreview';
import {
    templateSelectorStore,
    type TemplateSelectorController
} from '@/shared/stores/templateSelectorStore';
import ResumeTemplates from '@/templates/ResumeTemplates';
import builtinTemplatePreviewImages from '@/templates/builtinTemplatePreviewImages';
import type { ResumeSaveData } from '@/types';
import PageSize from '@/types/PageSize';

const noAdditionalTemplateGroups: AdditionalTemplateGroup[] = [];

export interface AdditionalTemplateOption {
    id: string;
    title: string;
    loadPreview?: () => Promise<ResumeSaveData>;
    previewImage?: string;
    previewAlt?: string;
    previewLabel?: string;
    use: () => Promise<void> | void;
    useLabel?: string;
    useDescription?: React.ReactNode;
}

export interface AdditionalTemplateGroup {
    id: string;
    heading: React.ReactNode;
    templates: AdditionalTemplateOption[];
    emptyState?: React.ReactNode;
}

export interface ResumeTemplateSelectorProps {
    topNav: React.ReactNode;
    pageSize: PageSize;
    additionalTemplateGroups?: AdditionalTemplateGroup[];
    createDocumentFromTemplate?: (key?: string) => Promise<void> | void;
    store?: TemplateSelectorController;
}

function compareTitles(left: string, right: string): number {
    return left.localeCompare(right, undefined, { sensitivity: 'base' });
}

function findAdditionalTemplate(
    groups: readonly AdditionalTemplateGroup[],
    selectedKey?: string
): AdditionalTemplateOption | undefined {
    if (!selectedKey) return undefined;

    for (const group of groups) {
        for (const template of group.templates) {
            if (`${group.id}:${template.id}` === selectedKey) return template;
        }
    }

    return undefined;
}

function BuiltInTemplatePreview(props: { templateKey: string }) {
    const image = builtinTemplatePreviewImages[props.templateKey]
        ?? builtinTemplatePreviewImages.Integrity;

    return (
        <div className="template-preview-image">
            <img src={image} alt={`${props.templateKey} template preview`} />
        </div>
    );
}

/** Adapts the framework-neutral template selector store to the template-selection view. */
export default function ResumeTemplateSelector(props: ResumeTemplateSelectorProps) {
    const store = props.store ?? templateSelectorStore;
    const snapshot = React.useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        store.getSnapshot
    );
    const groups = props.additionalTemplateGroups ?? noAdditionalTemplateGroups;
    const additionalTemplate = findAdditionalTemplate(groups, snapshot.selectedAdditionalKey);

    React.useEffect(() => {
        store.configure({
            groups,
            useBuiltInTemplate: props.createDocumentFromTemplate
        });
    }, [groups, props.createDocumentFromTemplate, store]);

    const templateNames = Object.keys(ResumeTemplates.templates).sort(compareTitles);
    const sortedGroups = groups.map((group) => ({
        ...group,
        templates: [...group.templates].sort((left, right) => compareTitles(left.title, right.title))
    }));
    const sidebar = (
        <div id="template-selector">
            <PureMenu>
                {templateNames.map((key) => (
                    <PureMenuItem
                        key={key}
                        selected={!snapshot.selectedAdditionalKey
                            && key === snapshot.selectedBuiltInKey}
                        onClick={() => store.selectBuiltIn(key)}
                    >
                        <PureMenuLink>{key}</PureMenuLink>
                    </PureMenuItem>
                ))}
                {sortedGroups.map((group) => (
                    <React.Fragment key={group.id}>
                        <PureMenuItem className="template-selector-group-heading">
                            {group.heading}
                        </PureMenuItem>
                        {group.templates.length
                            ? group.templates.map((template) => {
                                const key = `${group.id}:${template.id}`;
                                const selected = snapshot.selectedAdditionalKey === key;
                                return (
                                    <React.Fragment key={key}>
                                        <PureMenuItem
                                            selected={selected}
                                            onClick={() => store.selectAdditional(group.id, template.id)}
                                        >
                                            <PureMenuLink>{template.title}</PureMenuLink>
                                        </PureMenuItem>
                                        {selected
                                            ? (
                                                <PureMenuItem className="template-selector-selected-action">
                                                    {template.useDescription
                                                        ? (
                                                            <p className="template-selector-action-description">
                                                                {template.useDescription}
                                                            </p>
                                                        )
                                                        : <></>}
                                                    <Button
                                                        className="template-selector-primary-action"
                                                        disabled={snapshot.actionStatus === 'using'
                                                            || snapshot.preview.status !== 'ready'}
                                                        onClick={() => void store.useSelected()}
                                                        variant="primary"
                                                    >
                                                        {snapshot.actionStatus === 'using'
                                                            ? 'Creating…'
                                                            : template.useLabel ?? 'Use this Template'}
                                                    </Button>
                                                </PureMenuItem>
                                            )
                                            : <></>}
                                    </React.Fragment>
                                );
                            })
                            : (
                                <PureMenuItem className="template-selector-empty-state">
                                    {group.emptyState}
                                </PureMenuItem>
                            )}
                    </React.Fragment>
                ))}
            </PureMenu>
            {snapshot.actionError
                ? <p className="template-selector-error" role="alert">{snapshot.actionError}</p>
                : <></>}
            {!additionalTemplate
                ? (
                    <Button
                        className="template-selector-primary-action"
                        disabled={snapshot.actionStatus === 'using'}
                        onClick={() => void store.useSelected()}
                        variant="primary"
                    >
                        {snapshot.actionStatus === 'using' ? 'Creating…' : 'Use this Template'}
                    </Button>
                )
                : <></>}
        </div>
    );

    let preview: React.ReactNode;
    if (!additionalTemplate) {
        preview = <BuiltInTemplatePreview templateKey={snapshot.selectedBuiltInKey} />;
    } else if (snapshot.preview.status === 'error') {
        preview = (
            <div className="template-preview-status" role="alert">
                {snapshot.preview.message}
            </div>
        );
    } else if (snapshot.preview.status === 'ready' && snapshot.preview.image) {
        preview = (
            <div className="template-preview-image">
                <div className="template-preview-label">
                    {additionalTemplate.previewLabel ?? 'Preview only'}
                </div>
                <img
                    src={snapshot.preview.image}
                    alt={additionalTemplate.previewAlt
                        ?? `${additionalTemplate.title} template preview`}
                />
            </div>
        );
    } else if (snapshot.preview.status === 'ready' && snapshot.preview.data) {
        preview = (
            <div className="template-preview-paper">
                <ResumePreviewFrame
                    data={snapshot.preview.data}
                    pageSize={snapshot.preview.data.pageSize ?? props.pageSize}
                    ariaLabel={`${additionalTemplate.title} template preview`}
                    target="isolated-preview"
                    iframeClassName="template-preview-frame"
                    fitDocument
                />
            </div>
        );
    } else {
        preview = (
            <div className="template-preview-status" role="status">
                Loading template preview…
            </div>
        );
    }

    return (
        <StaticSidebarLayout
            topNav={props.topNav}
            main={preview}
            sidebar={sidebar}
        />
    );
}
