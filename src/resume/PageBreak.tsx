import Container from "@/resume/infrastructure/Container";
import ResumeComponentProps from "@/types";

function PageBreak(props: ResumeComponentProps) {
    return (
        <Container
            {...props}
            className="page-break page-break-editing"
            displayAs="div"
        >
            <span className="page-break-label">
                Page Break
            </span>
        </Container>
    );
}

PageBreak.type = 'PageBreak';

export default PageBreak;
