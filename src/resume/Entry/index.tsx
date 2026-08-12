import * as React from "react";
import TextField from "@/controls/inputs/TextField";
import Container from "@/resume/infrastructure/Container";
import { process } from "@/shared/utils/processText";
import toUrl from "@/shared/utils/toUrl";
import { deleteAt } from "@/shared/utils/arrayHelpers";
import ResumeComponentProps, { BasicResumeNode } from "@/types";
import { useIsNodeEditing, useIsNodeSelected } from "@/shared/stores/editorStore";
import FieldAdder from "./FieldAdder";

import "./Entry.scss";

interface EntryBase {
    title?: string[];
    subtitle?: string[];

    /** Position of subtitle line breaks */
    subtitleBreaks?: number[];
}

export interface BasicEntryProps extends BasicResumeNode<EntryBase> { };
export interface EntryProps extends ResumeComponentProps<EntryBase> { };

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
    const [newField, setNewField] = React.useState<{
        key: 'title' | 'subtitle';
        index: number;
    }>();

    const addField = (key: 'title' | 'subtitle') => {
        const fields = props[key] || [];
        setNewField({ key, index: fields.length });
        props.updateData(key, [...fields, ""]);
    };

    const getFields = (key: 'title' | 'subtitle') => {
        const deleter = (key: 'title' | 'subtitle', index: number) => {
            const arr = props[key] || [];
            const nextFields = deleteAt(arr, index);

            if (key === "subtitle" && props.subtitleBreaks) {
                const nextSubtitleBreaks = props.subtitleBreaks
                    .filter((breakIndex) => breakIndex !== index)
                    .map((breakIndex) => breakIndex > index ? breakIndex - 1 : breakIndex);

                props.updateDataFields({
                    subtitle: nextFields,
                    subtitleBreaks: nextSubtitleBreaks
                });
                return;
            }

            props.updateData(key, nextFields);
        }

        const updater = (key: 'title' | 'subtitle', index: number, text: string) => {
            const replTitle = [...(props[key] || [])];

            // Replace contents
            replTitle[index] = text;
            props.updateData(key, replTitle);
        }

        const fields = props[key];
        if (fields) {
            return fields.map((text, index, arr) => {
                /** Conditionally add line break */
                let lineBreak = <></>
                if (key === 'subtitle' && props.subtitleBreaks?.includes(index)) {
                    lineBreak = <hr style={{
                        flexBasis: "100%",
                        border: 0
                    }}/>
                }

                const canDelete = key === "subtitle" || arr.length > 1;
                const textFieldOptions = canDelete ? [
                    {
                        text: `Delete "${text}"`,
                        onClick: () => deleter(key, index)
                    }
                ] : [];

                return <React.Fragment key={`${index}/${arr.length}`}>
                    <TextField
                        displayClassName={getFieldClassName(index, arr)}
                        static={!isSelected}
                        startEditing={newField?.key === key && newField.index === index}
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
        <Container
            {...props}
            attributes={{
                "data-selection-hint": isEditing
                    ? "Finish editing to see field options"
                    : "Right-click fields for more options"
            }}
            className={`entry${isSelected ? " entry--selected" : ""}${isEditing ? " entry--editing" : ""}`}
            displayAs="article"
        >
            <hgroup onClick={(event) => {
                if (isEditing) {
                    event.stopPropagation();
                }
            }}>
                <h3 className="title">
                    {getFields('title')}
                    {isEditing && <FieldAdder compact label="Add title" onAdd={() => addField('title')} />}
                </h3>
                <h4 className="subtitle">
                    {getFields('subtitle')}
                    {isEditing && <FieldAdder compact label="Add detail" onAdd={() => addField('subtitle')} />}
                </h4>
                {isSelected && !isEditing && (
                    <span className="entry-field-actions no-print">
                        <FieldAdder label="Add title" onAdd={() => addField('title')} />
                        <FieldAdder label="Add detail" onAdd={() => addField('subtitle')} />
                    </span>
                )}
            </hgroup>
            {isSelected && (
                <div className="entry-field-help no-print" aria-hidden="true">
                    {isEditing
                        ? "Finish editing to see field options"
                        : "Right-click fields for more options"}
                </div>
            )}

            {props.children}
        </Container>
    );
}

Entry.type = 'Entry';
