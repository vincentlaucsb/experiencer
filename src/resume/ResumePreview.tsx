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
import { ResumeNode, ResumeSaveData } from "@/types";
import PageSize from "@/types/PageSize";

const noopUpdate = () => {};

const isolatedCanvasStyles = `
    html, body {
        margin: 0;
        background: white;
    }

    #resume {
        background: white;
        width: 8.5in;
        min-height: 11in;
        box-sizing: border-box;
        margin: 0 auto;
    }

    #resume[data-page-size="a4"] {
        width: 210mm;
        min-height: 297mm;
    }
`;

export interface ResumePreviewProps {
    data: ResumeSaveData;
    pageSize: PageSize;
    ariaLabel: string;
    isolated?: boolean;
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
        removeOnUnmount: true
    });

    return (
        <>
            <style>{props.preview.stylesheet}</style>
            <ResumeRenderer
                nodes={props.preview.nodes}
                pageSize={props.pageSize}
                ariaLabel={props.ariaLabel}
                readOnly
                updateResumeData={noopUpdate}
                updateResumeDataFields={noopUpdate}
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

        copyApplicationStyles(document, frameDocument);
        ensureGoogleFontsLink(
            extractFontFamiliesFromCss(props.preview.stylesheet),
            frameDocument
        );
    }, [frameDocument, props.preview.stylesheet]);

    const contents = frameDocument && createPortal(
        <>
            <style>{`${isolatedCanvasStyles}\n${props.preview.stylesheet}`}</style>
            <ResumeRenderer
                nodes={props.preview.nodes}
                pageSize={props.pageSize}
                ariaLabel={props.ariaLabel}
                readOnly
                updateResumeData={noopUpdate}
                updateResumeDataFields={noopUpdate}
            />
        </>,
        frameDocument.body
    );

    return (
        <>
            {contents}
            <iframe
                className={props.iframeClassName}
                title={props.iframeTitle ?? props.ariaLabel}
                srcDoc="<!doctype html><html><head></head><body></body></html>"
                onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
            />
        </>
    );
}

function copyApplicationStyles(source: Document, target: Document) {
    target.head
        .querySelectorAll("[data-resume-preview-app-style]")
        .forEach((node) => node.remove());

    source.head
        .querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
            'style, link[rel="stylesheet"]'
        )
        .forEach((node) => {
            if (node.id === "template-google-fonts") return;

            const clone = node.cloneNode(true) as HTMLStyleElement | HTMLLinkElement;
            clone.setAttribute("data-resume-preview-app-style", "");
            target.head.appendChild(clone);
        });
}
