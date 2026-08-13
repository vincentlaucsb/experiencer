import { getBuiltinFontStylesheet, getGoogleFontRequests } from '@/shared/fonts/builtinFonts';
import type { PreparedResumeDocument } from '@/shared/resumeDocument/prepareResumeDocument';
import {
    ensureGoogleFontsLink,
    extractFontFamiliesFromCss
} from '@/shared/utils/fonts';

export const RESUME_STYLESHEET_ID = 'resume-document-stylesheet';
export const RESUME_BUILTIN_FONTS_ID = 'resume-document-builtin-fonts';
export const RESUME_GOOGLE_FONTS_ID = 'resume-document-google-fonts';

/** Remove host-application styles while retaining the prepared résumé document head. */
export function isolateResumeDocumentHead(
    target: Document,
    retainedInfrastructureIds: Iterable<string> = []
): void {
    const retainedIds = new Set([
        RESUME_STYLESHEET_ID,
        RESUME_BUILTIN_FONTS_ID,
        RESUME_GOOGLE_FONTS_ID,
        ...retainedInfrastructureIds
    ]);
    target.head.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
        'style, link[rel="stylesheet"]'
    ).forEach((element) => {
        if (!retainedIds.has(element.id)) element.remove();
    });
}

function installStyle(target: Document, id: string, stylesheet: string): void {
    target.getElementById(id)?.remove();
    const style = target.createElement('style');
    style.id = id;
    style.textContent = stylesheet;
    target.head.appendChild(style);
}

/** Install only document-owned CSS and fonts into a standalone browser document. */
export function installResumeDocumentHead(
    target: Document,
    prepared: PreparedResumeDocument
): () => void {
    installStyle(target, RESUME_STYLESHEET_ID, prepared.stylesheet);
    installStyle(
        target,
        RESUME_BUILTIN_FONTS_ID,
        getBuiltinFontStylesheet(prepared.fonts)
    );
    ensureGoogleFontsLink(
        getGoogleFontRequests(
            prepared.fonts ?? extractFontFamiliesFromCss(prepared.stylesheet)
        ),
        target,
        RESUME_GOOGLE_FONTS_ID
    );

    return () => {
        target.getElementById(RESUME_STYLESHEET_ID)?.remove();
        target.getElementById(RESUME_BUILTIN_FONTS_ID)?.remove();
        target.getElementById(RESUME_GOOGLE_FONTS_ID)?.remove();
    };
}

/** Make the browser body itself the standalone résumé canvas. */
export function configureResumeDocumentBody(
    target: Document,
    prepared: PreparedResumeDocument
): () => void {
    const body = target.body;
    const previous = {
        pageSize: body.dataset.pageSize,
        ariaLabel: body.getAttribute('aria-label'),
        marker: body.hasAttribute('data-resume-document'),
        width: body.style.width,
        minHeight: body.style.minHeight,
        boxSizing: body.style.boxSizing,
        margin: body.style.margin,
        pointerEvents: body.style.pointerEvents
    };

    body.dataset.pageSize = prepared.pageSize;
    body.setAttribute('aria-label', prepared.ariaLabel);
    body.setAttribute('data-resume-document', prepared.target);
    body.style.width = prepared.width;
    body.style.minHeight = prepared.minHeight;
    body.style.boxSizing = 'border-box';
    body.style.margin = '0 auto';
    body.style.pointerEvents = 'none';

    return () => {
        if (previous.pageSize === undefined) delete body.dataset.pageSize;
        else body.dataset.pageSize = previous.pageSize;
        if (previous.ariaLabel === null) body.removeAttribute('aria-label');
        else body.setAttribute('aria-label', previous.ariaLabel);
        if (!previous.marker) body.removeAttribute('data-resume-document');
        body.style.width = previous.width;
        body.style.minHeight = previous.minHeight;
        body.style.boxSizing = previous.boxSizing;
        body.style.margin = previous.margin;
        body.style.pointerEvents = previous.pointerEvents;
    };
}
