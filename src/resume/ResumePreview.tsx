import * as React from "react";
import { createPortal } from "react-dom";

import ResumeRenderer from "@/resume/ResumeRenderer";
import CssNode from "@/shared/CssTree";
import useGoogleFontsStylesheet from "@/shared/hooks/useGoogleFontsStylesheet";
import { assignIds } from "@/shared/utils/assignIds";
import { deepCopy } from "@/shared/utils/deepCopy";
import {
    ensureGoogleFontsLink,
    extractFontFamiliesFromCss
} from "@/shared/utils/fonts";
import { getBuiltinFontStylesheet } from '@/shared/fonts/builtinFonts';
import { getGoogleFontRequests } from '@/shared/fonts/builtinFonts';
import getResumeMinHeight from '@/shared/utils/getResumeMinHeight';
import { ResumeNode, ResumeSaveData } from "@/types";
import PageSize from "@/types/PageSize";

const noopUpdate = () => {};

export interface ResumePreviewProps {
    data: ResumeSaveData;
    pageSize: PageSize;
    ariaLabel: string;
    isolated?: boolean;
    /** Render document nodes directly under the host body instead of #resume. */
    standalone?: boolean;
    iframeTitle?: string;
    iframeClassName?: string;
}

interface PreparedPreview {
    nodes: ResumeNode[];
    stylesheet: string;
}

export function getResumeStylesheet(data: ResumeSaveData): string {
    return `${CssNode.load(data.rootCss).stylesheet()}\n\n${
        CssNode.load(data.builtinCss).stylesheet()
    }`;
}

function preparePreview(data: ResumeSaveData): PreparedPreview {
    return {
        nodes: assignIds(deepCopy(data.childNodes) as ResumeSaveData["childNodes"]),
        stylesheet: getResumeStylesheet(data)
    };
}

/**
 * Read-only resume host used by template selection and revision history.
 * It owns snapshot normalization, template CSS, and document font loading.
 */
export default function ResumePreview(props: ResumePreviewProps) {
    const preview = React.useMemo(() => preparePreview(props.data), [props.data]);

    if (props.isolated) {
        return <IsolatedPreview {...props} preview={preview} />;
    }

    return <InlinePreview {...props} preview={preview} />;
}

function InlinePreview(
    props: ResumePreviewProps & { preview: PreparedPreview }
) {
    useGoogleFontsStylesheet(props.preview.stylesheet, {
        linkId: "resume-preview-google-fonts",
        removeOnUnmount: true,
        fontFamilies: props.data.fonts
    });
    useStandaloneDocumentCanvas(
        props.standalone === true,
        document,
        props.pageSize,
        props.preview.nodes,
        props.ariaLabel
    );

    return (
        <>
            <style data-resume-preview-builtin-fonts>{getBuiltinFontStylesheet(props.data.fonts)}</style>
            <style>{props.preview.stylesheet}</style>
            <ResumeRenderer
                nodes={props.preview.nodes}
                pageSize={props.pageSize}
                ariaLabel={props.ariaLabel}
                readOnly
                updateResumeData={noopUpdate}
                updateResumeDataFields={noopUpdate}
                renderContainer={!props.standalone}
            />
        </>
    );
}

function IsolatedPreview(
    props: ResumePreviewProps & { preview: PreparedPreview }
) {
    const [frameDocument, setFrameDocument] = React.useState<Document | null>(null);

    React.useEffect(() => {
        if (!frameDocument) return;

        frameDocument.head.querySelector('#resume-preview-stylesheet')?.remove();
        const resumeStyles = frameDocument.createElement('style');
        resumeStyles.id = 'resume-preview-stylesheet';
        resumeStyles.textContent = props.preview.stylesheet;
        frameDocument.head.appendChild(resumeStyles);

        frameDocument.head.querySelector('[data-resume-preview-builtin-fonts]')?.remove();
        const builtinStyles = frameDocument.createElement('style');
        builtinStyles.setAttribute('data-resume-preview-builtin-fonts', '');
        builtinStyles.textContent = getBuiltinFontStylesheet(props.data.fonts);
        frameDocument.head.appendChild(builtinStyles);
        ensureGoogleFontsLink(
            getGoogleFontRequests(props.data.fonts
                ?? extractFontFamiliesFromCss(props.preview.stylesheet)),
            frameDocument
        );
    }, [frameDocument, props.data.fonts, props.preview.stylesheet]);

    useStandaloneDocumentCanvas(
        Boolean(frameDocument),
        frameDocument,
        props.pageSize,
        props.preview.nodes,
        props.ariaLabel
    );

    const contents = frameDocument && createPortal(
        <ResumeRenderer
            nodes={props.preview.nodes}
            pageSize={props.pageSize}
            ariaLabel={props.ariaLabel}
            readOnly
            updateResumeData={noopUpdate}
            updateResumeDataFields={noopUpdate}
            renderContainer={false}
        />,
        frameDocument.body
    );

    return (
        <>
            {contents}
            <iframe
                className={props.iframeClassName}
                title={props.iframeTitle ?? props.ariaLabel}
                aria-label={props.ariaLabel}
                srcDoc="<!doctype html><html><head></head><body></body></html>"
                onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
            />
        </>
    );
}

/**
 * Gives a standalone preview the same paper geometry as an exported document.
 * Its body is deliberately the document root: authored `body` rules must apply
 * to the resume nodes directly rather than to an editor-only wrapper.
 */
function useStandaloneDocumentCanvas(
    enabled: boolean,
    target: Document | null,
    pageSize: PageSize,
    nodes: ResumeNode[],
    ariaLabel: string
) {
    const minHeight = React.useMemo(
        () => getResumeMinHeight(nodes, pageSize),
        [nodes, pageSize]
    );

    React.useLayoutEffect(() => {
        if (!enabled || !target) return;

        const body = target.body;
        const previous = {
            pageSize: body.dataset.pageSize,
            ariaLabel: body.getAttribute('aria-label'),
            documentMarker: body.hasAttribute('data-resume-preview-document'),
            width: body.style.width,
            minHeight: body.style.minHeight,
            boxSizing: body.style.boxSizing,
            margin: body.style.margin,
            pointerEvents: body.style.pointerEvents
        };

        body.dataset.pageSize = pageSize;
        body.setAttribute('aria-label', ariaLabel);
        body.setAttribute('data-resume-preview-document', '');
        body.style.width = pageSize === PageSize.A4 ? '210mm' : '8.5in';
        body.style.minHeight = minHeight;
        body.style.boxSizing = 'border-box';
        body.style.margin = '0 auto';
        body.style.pointerEvents = 'none';

        return () => {
            if (previous.pageSize === undefined) delete body.dataset.pageSize;
            else body.dataset.pageSize = previous.pageSize;
            if (previous.ariaLabel === null) body.removeAttribute('aria-label');
            else body.setAttribute('aria-label', previous.ariaLabel);
            if (!previous.documentMarker) body.removeAttribute('data-resume-preview-document');
            body.style.width = previous.width;
            body.style.minHeight = previous.minHeight;
            body.style.boxSizing = previous.boxSizing;
            body.style.margin = previous.margin;
            body.style.pointerEvents = previous.pointerEvents;
        };
    }, [ariaLabel, enabled, minHeight, pageSize, target]);
}
