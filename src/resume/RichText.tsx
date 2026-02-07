import * as React from "react";
import * as Helpers from "@/shared/utils/Helpers";
import QuillEditor from "@/controls/inputs/QuillEditor";
import Container from "./Container";
import ResumeComponentProps from "@/shared/utils/Types";
import { useIsNodeEditing } from "@/shared/stores/editorStore";

export default function RichText(props: ResumeComponentProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    const textValue = Helpers.process(props.value) as string || "Empty text";
    
    if (isEditing) {
        return (
            <Container className="rich-text" {...props}>
                <QuillEditor
                    id={props.uuid}
                    value={props.value || ""}
                    htmlId={props.htmlId}
                    onChange={(value) => props.updateData("value", value)}
                />
            </Container>
        );
    }

    return (
        <Container {...props} className="rich-text">
            <span dangerouslySetInnerHTML={{ __html: textValue }} />
        </Container>
    );
}

RichText.type = 'Rich Text';