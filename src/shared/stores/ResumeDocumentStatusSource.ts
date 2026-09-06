export interface ResumeDocumentStatus {
    readonly busy: boolean;
    readonly message?: string;
}

/** Injectable document-level status; the shared row does not own operation workflows. */
export interface ResumeDocumentStatusSource {
    subscribe(documentId: string, listener: () => void): () => void;
    getSnapshot(documentId: string): ResumeDocumentStatus;
}

export const idleResumeDocumentStatus: ResumeDocumentStatus = Object.freeze({ busy: false });
export const idleResumeDocumentStatusSource: ResumeDocumentStatusSource = {
    subscribe: () => () => undefined,
    getSnapshot: () => idleResumeDocumentStatus
};
