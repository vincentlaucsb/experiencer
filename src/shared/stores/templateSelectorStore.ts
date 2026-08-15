import loadData from '@/shared/stores/loadData';
import ResumeTemplates from '@/templates/ResumeTemplates';
import type { ResumeSaveData } from '@/types';

export type TemplatePreviewStatus = 'idle' | 'loading' | 'ready' | 'error';
export type TemplateActionStatus = 'idle' | 'using';

export interface TemplatePreviewSnapshot {
    status: TemplatePreviewStatus;
    data?: ResumeSaveData;
    image?: string;
    message?: string;
}

export interface TemplateSelectorSnapshot {
    selectedBuiltInKey: string;
    selectedAdditionalKey?: string;
    preview: TemplatePreviewSnapshot;
    actionStatus: TemplateActionStatus;
    actionError?: string;
}

export interface TemplateSelectorOption {
    id: string;
    loadPreview?: () => Promise<ResumeSaveData>;
    previewImage?: string;
    use: () => Promise<void> | void;
}

export interface TemplateSelectorGroupConfiguration {
    id: string;
    templates: readonly TemplateSelectorOption[];
}

export interface TemplateSelectorConfiguration {
    groups: readonly TemplateSelectorGroupConfiguration[];
    useBuiltInTemplate?: (key: string) => Promise<void> | void;
}

export interface TemplateSelectorController {
    subscribe(listener: () => void): () => void;
    getSnapshot(): TemplateSelectorSnapshot;
    configure(configuration: TemplateSelectorConfiguration): void;
    selectBuiltIn(key: string): void;
    selectAdditional(groupId: string, templateId: string): void;
    useSelected(): Promise<void>;
}

const idlePreview: TemplatePreviewSnapshot = { status: 'idle' };

const unavailableMessage = 'This template is no longer available.';

function additionalKey(groupId: string, templateId: string): string {
    return `${groupId}:${templateId}`;
}

function previewErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Could not load this template preview.';
}

function actionErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Could not create a document from this template.';
}

/** Owns template selection and asynchronous template workflows independently of React. */
export class TemplateSelectorStore implements TemplateSelectorController {
    private snapshot: TemplateSelectorSnapshot = {
        selectedBuiltInKey: 'Integrity',
        preview: idlePreview,
        actionStatus: 'idle'
    };
    private readonly listeners = new Set<() => void>();
    private options = new Map<string, TemplateSelectorOption>();
    private useBuiltInTemplate: (key: string) => Promise<void> | void;
    private previewRequestId = 0;
    private actionRequestId = 0;

    constructor(
        private readonly fallbackUseBuiltInTemplate: (key: string) => Promise<void> | void
    ) {
        this.useBuiltInTemplate = fallbackUseBuiltInTemplate;
    }

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.snapshot;

    configure = (configuration: TemplateSelectorConfiguration): void => {
        const selectedKey = this.snapshot.selectedAdditionalKey;
        const previousOption = selectedKey ? this.options.get(selectedKey) : undefined;
        const options = new Map<string, TemplateSelectorOption>();

        for (const group of configuration.groups) {
            for (const template of group.templates) {
                options.set(additionalKey(group.id, template.id), template);
            }
        }

        this.options = options;
        this.useBuiltInTemplate = configuration.useBuiltInTemplate
            ?? this.fallbackUseBuiltInTemplate;

        if (!selectedKey) return;

        const selectedOption = options.get(selectedKey);
        if (!selectedOption) {
            this.invalidateRequests();
            this.setSnapshot({
                ...this.snapshot,
                selectedAdditionalKey: undefined,
                preview: idlePreview,
                actionStatus: 'idle',
                actionError: unavailableMessage
            });
            return;
        }

        if (selectedOption !== previousOption) {
            this.loadPreview(selectedKey, selectedOption);
        }
    };

    selectBuiltIn = (key: string): void => {
        this.invalidateRequests();
        this.setSnapshot({
            selectedBuiltInKey: key,
            preview: idlePreview,
            actionStatus: 'idle'
        });
    };

    selectAdditional = (groupId: string, templateId: string): void => {
        const key = additionalKey(groupId, templateId);
        const option = this.options.get(key);

        this.invalidateRequests();
        if (!option) {
            this.setSnapshot({
                ...this.snapshot,
                selectedAdditionalKey: undefined,
                preview: idlePreview,
                actionStatus: 'idle',
                actionError: unavailableMessage
            });
            return;
        }

        this.loadPreview(key, option);
    };

    useSelected = async (): Promise<void> => {
        if (this.snapshot.actionStatus === 'using') return;

        const selectedKey = this.snapshot.selectedAdditionalKey;
        const option = selectedKey ? this.options.get(selectedKey) : undefined;
        if (selectedKey && !option) {
            this.setSnapshot({ ...this.snapshot, actionError: unavailableMessage });
            return;
        }

        const requestId = ++this.actionRequestId;
        const command = option?.use
            ?? (() => this.useBuiltInTemplate(this.snapshot.selectedBuiltInKey));
        this.setSnapshot({
            ...this.snapshot,
            actionStatus: option ? 'using' : 'idle',
            actionError: undefined
        });

        try {
            await command();
        } catch (error: unknown) {
            if (requestId !== this.actionRequestId) return;
            this.setSnapshot({
                ...this.snapshot,
                actionStatus: 'idle',
                actionError: actionErrorMessage(error)
            });
            return;
        }

        if (requestId !== this.actionRequestId) return;
        if (this.snapshot.actionStatus !== 'idle') {
            this.setSnapshot({ ...this.snapshot, actionStatus: 'idle' });
        }
    };

    reset = (): void => {
        this.invalidateRequests();
        this.options = new Map();
        this.useBuiltInTemplate = this.fallbackUseBuiltInTemplate;
        this.setSnapshot({
            selectedBuiltInKey: 'Integrity',
            preview: idlePreview,
            actionStatus: 'idle'
        });
    };

    private loadPreview(key: string, option: TemplateSelectorOption): void {
        const requestId = ++this.previewRequestId;
        ++this.actionRequestId;

        if (option.previewImage) {
            this.setSnapshot({
                ...this.snapshot,
                selectedAdditionalKey: key,
                preview: { status: 'ready', image: option.previewImage },
                actionStatus: 'idle',
                actionError: undefined
            });
            return;
        }

        if (!option.loadPreview) {
            this.setSnapshot({
                ...this.snapshot,
                selectedAdditionalKey: key,
                preview: {
                    status: 'error',
                    message: 'This template preview is unavailable.'
                },
                actionStatus: 'idle',
                actionError: undefined
            });
            return;
        }

        this.setSnapshot({
            ...this.snapshot,
            selectedAdditionalKey: key,
            preview: { status: 'loading' },
            actionStatus: 'idle',
            actionError: undefined
        });

        let preview: Promise<ResumeSaveData>;
        try {
            preview = option.loadPreview();
        } catch (error: unknown) {
            this.finishPreviewError(requestId, key, error);
            return;
        }

        void preview
            .then((data) => {
                if (!this.isCurrentPreview(requestId, key)) return;
                this.setSnapshot({
                    ...this.snapshot,
                    preview: { status: 'ready', data }
                });
            })
            .catch((error: unknown) => this.finishPreviewError(requestId, key, error));
    }

    private finishPreviewError(requestId: number, key: string, error: unknown): void {
        if (!this.isCurrentPreview(requestId, key)) return;
        this.setSnapshot({
            ...this.snapshot,
            preview: {
                status: 'error',
                message: previewErrorMessage(error)
            }
        });
    }

    private isCurrentPreview(requestId: number, key: string): boolean {
        return requestId === this.previewRequestId
            && key === this.snapshot.selectedAdditionalKey;
    }

    private invalidateRequests(): void {
        ++this.previewRequestId;
        ++this.actionRequestId;
    }

    private setSnapshot(snapshot: TemplateSelectorSnapshot): void {
        this.snapshot = snapshot;
        this.listeners.forEach((listener) => listener());
    }
}

const useDefaultBuiltInTemplate = (key: string): void => {
    loadData(ResumeTemplates.templates[key], 'changingTemplate');
};

export const templateSelectorStore = new TemplateSelectorStore(useDefaultBuiltInTemplate);
