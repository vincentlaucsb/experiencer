import Container from "@/resume/infrastructure/Container";

import { useIsPrinting } from "@/shared/stores/printStore";

import ResumeComponentProps from "@/types";

function PageBreak(props: ResumeComponentProps) {
    const isPrinting = useIsPrinting();
    const className = isPrinting ? "page-break page-break-printing" : "page-break page-break-editing";

    return (
        <Container
            {...props}
            className={className}
            displayAs="resume-page-break"
        >
            {!isPrinting ? (
                <span className="page-break-label">
                    Page Break
                </span>
            ) : null}
        </Container>
    );
}

PageBreak.type = 'PageBreak';

export default PageBreak;
