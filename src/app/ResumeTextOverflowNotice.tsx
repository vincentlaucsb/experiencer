import * as React from 'react';
import PageSize from '@/types/PageSize';
import Modal from '@/controls/Modal';
import { Button } from '@/controls/Buttons';
import { resumeOutputController } from '@/shared/services/ResumeOutputController';
import { resumeTextOverflowStore } from '@/shared/stores/resumeTextOverflowStore';

/** Keeps export advisories outside the authored document and all standalone render targets. */
export default function ResumeTextOverflowNotice(props: { resumeRef: React.RefObject<HTMLDivElement | null>; pageSize: PageSize }) {
    const summary = React.useSyncExternalStore(resumeTextOverflowStore.subscribe, resumeTextOverflowStore.getSnapshot, resumeTextOverflowStore.getSnapshot);
    const reviewingPrint = React.useSyncExternalStore(resumeOutputController.subscribePrintReview,
        resumeOutputController.getPrintReviewSnapshot, resumeOutputController.getPrintReviewSnapshot);
    React.useEffect(() => {
        if (props.resumeRef.current) return resumeOutputController.bindEditor(props.resumeRef.current, props.pageSize);
    }, [props.resumeRef, props.pageSize]);
    return <>
        {summary.count > 0 && <p role="status" className="app-p-3 app-m-0">
            Text extends past a column or page edge and may be clipped in PDF. Check long words or URLs before printing.
        </p>}
        <Modal isOpen={reviewingPrint} title="Text may be clipped in PDF" close={resumeOutputController.cancelPrintReview}
            className="confirmation-modal">
            <div className="confirmation-modal-body">
                <p className="app-m-0">Some text extends past a column or page edge. You can return to the editor to fix long words or URLs, or continue printing this document.</p>
                <div className="confirmation-modal-actions">
                    <Button appearance="outline" onClick={resumeOutputController.cancelPrintReview}>Return to editor</Button>
                    <Button variant="primary" onClick={resumeOutputController.continuePrint}>Continue printing</Button>
                </div>
            </div>
        </Modal>
    </>;
}
