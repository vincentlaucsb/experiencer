import * as React from 'react';
import { createPortal } from 'react-dom';

import ResumeRenderer from '@/resume/ResumeRenderer';
import {
    configureResumeDocumentBody,
    installResumeDocumentHead
} from '@/shared/resumeDocument/browserResumeDocument';
import {
    createResumeDocumentSource,
    prepareResumeDocument,
    type PreparedResumeDocument,
    type ResumeRenderTarget
} from '@/shared/resumeDocument/prepareResumeDocument';
import type { ResumeSaveData } from '@/types';
import PageSize from '@/types/PageSize';

const noopUpdate = () => undefined;

interface BaseResumePreviewProps {
    data: ResumeSaveData;
    pageSize: PageSize;
    ariaLabel: string;
}

export interface ResumePreviewFrameProps extends BaseResumePreviewProps {
    target: Extract<ResumeRenderTarget, 'isolated-preview' | 'render-service'>;
    iframeTitle?: string;
    iframeClassName?: string;
    iframeRef?: React.Ref<HTMLIFrameElement>;
}

export interface StandaloneResumePreviewProps extends BaseResumePreviewProps {
    target: Extract<ResumeRenderTarget, 'standalone-preview' | 'render-service'>;
}

function usePreparedPreview(
    props: BaseResumePreviewProps,
    target: ResumeRenderTarget
): PreparedResumeDocument {
    return React.useMemo(
        () => prepareResumeDocument(
            createResumeDocumentSource(props.data, props.ariaLabel, props.pageSize),
            target
        ),
        [props.ariaLabel, props.data, props.pageSize, target]
    );
}

function ReadOnlyResumeDocument(props: { prepared: PreparedResumeDocument }) {
    return (
        <ResumeRenderer
            nodes={props.prepared.nodes}
            pageSize={props.prepared.pageSize}
            ariaLabel={props.prepared.ariaLabel}
            readOnly
            root={props.prepared.root}
            updateResumeData={noopUpdate}
            updateResumeDataFields={noopUpdate}
        />
    );
}

/** A fully isolated preview whose body is the authored document root. */
export function ResumePreviewFrame(props: ResumePreviewFrameProps) {
    const prepared = usePreparedPreview(props, props.target);
    const [frameDocument, setFrameDocument] = React.useState<Document | null>(null);

    React.useLayoutEffect(() => {
        if (!frameDocument) return;
        const removeHead = installResumeDocumentHead(frameDocument, prepared);
        const restoreBody = configureResumeDocumentBody(frameDocument, prepared);
        return () => {
            restoreBody();
            removeHead();
        };
    }, [frameDocument, prepared]);

    const contents = frameDocument && createPortal(
        <ReadOnlyResumeDocument prepared={prepared} />,
        frameDocument.body
    );

    return (
        <>
            {contents}
            <iframe
                ref={props.iframeRef}
                className={props.iframeClassName}
                title={props.iframeTitle ?? props.ariaLabel}
                aria-label={props.ariaLabel}
                srcDoc="<!doctype html><html><head></head><body></body></html>"
                onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
            />
        </>
    );
}

/** A dedicated document route whose own body is the authored document root. */
export function StandaloneResumePreview(props: StandaloneResumePreviewProps) {
    const prepared = usePreparedPreview(props, props.target);

    React.useLayoutEffect(() => {
        const removeHead = installResumeDocumentHead(document, prepared);
        const restoreBody = configureResumeDocumentBody(document, prepared);
        return () => {
            restoreBody();
            removeHead();
        };
    }, [prepared]);

    // The application mount remains editor infrastructure; authored selectors see
    // résumé nodes as direct body descendants, exactly as print and export do.
    return createPortal(<ReadOnlyResumeDocument prepared={prepared} />, document.body);
}
