import * as React from "react";
import TextField from "@/controls/inputs/TextField";
import { process, toUrl } from "@/shared/utils/Helpers";
import { deleteAt } from "@/shared/utils/arrayHelpers";
import ResumeComponentProps, { BasicResumeNode } from "@/types";
import { useIsNodeEditing, useIsNodeSelected } from "@/shared/stores/editorStore";
import Container from "@/resume/infrastructure/Container";

interface EntryBase {
    title?: string[];
    subtitle?: string[];

    /** Position of subtitle line breaks */
    subtitleBreaks?: number[];
}

export interface BasicEntryProps extends BasicResumeNode, EntryBase { };
export interface EntryProps extends ResumeComponentProps, EntryBase { };

/**
 * Generate the class name for the n-th field
 */
function getFieldClassName(index: number, arr: string[]) {
    const isLast = index === arr.length - 1;
    let classNames = ['field', `field-${index}`];
    if (isLast && index !== 0) {
        classNames.push('field-last');
    }
    else if (index > 0) {
        classNames.push('field-middle');
    }

    return classNames.join(' ');
}

export default function Entry(props: EntryProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    const isSelected = useIsNodeSelected(props.uuid);

    const getFields = (key: 'title' | 'subtitle') => {
        const deleter = (key: 'title' | 'subtitle', index: number) => {
            let arr = props[key] || [];
            props.updateData(key, deleteAt(arr, index));
        }

        const updater = (key: 'title' | 'subtitle', index: number, text: string) => {
            let replTitle = props[key] || [];

            // Replace contents
            replTitle[index] = text;
            props.updateData(key, replTitle);
        }

        const fields = props[key];
        if (fields) {
            return fields.map((text, index, arr) => {
                /** Conditionally add line break */
                let lineBreak = <></>
                if (props.subtitleBreaks && props.subtitleBreaks.indexOf(index) >= 0) {
                    lineBreak = <hr style={{
                        flexBasis: "100%",
                        border: 0
                    }}/>
                }

                const textFieldOptions = [
                    {
                        text: 'Delete',
                        action: () => deleter(key, index)
                    }
                ];

                return <React.Fragment key={`${index}/${arr.length}`}>
                    <TextField
                        displayClassName={getFieldClassName(index, arr)}
                        static={!isSelected}
                        onChange={(data: string) => updater(key, index, data)}
                        value={text || ""}
                        defaultText="Enter a value"
                        displayProcessors={[process, toUrl]}
                        contextMenuOptions={textFieldOptions}
                    />
                    {lineBreak}
                </React.Fragment>
            });
        }

        return <></>
    }

    /** hgroup onclick stops event from bubbling up to resume */
    return (
        <Container {...props} className="entry">
            <hgroup onClick={(event) => {
                if (isEditing) {
                    event.stopPropagation();
                }
            }}>
                <h3 className="title">{getFields('title')}</h3>
                <h4 className="subtitle">{getFields('subtitle')}</h4>
            </hgroup>

            {props.children}
        </Container>
    );
}

Entry.type = 'Entry';