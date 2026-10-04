import * as React from "react";
import { Button } from "@/controls/Buttons";
import { useNodeExtensions } from "@/shared/hooks/useNodeExtensions";
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
    /** Private tailoring guidance; persisted with the entry, never rendered. */
    notes?: string;
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
function getFieldClassName(index: number, count: number) {
    const isLast = index === count - 1;
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
    const actions = useNodeExtensions(props);
    const interactive = !props.readOnly;
    const isEditing = useIsNodeEditing(props.uuid) && interactive;
    const isSelected = useIsNodeSelected(props.uuid) && interactive;
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
        if (!fields) {
            return <></>;
        }

        // Blank slots are editor hints. Number only the fields that remain so
        // separator classes such as field-0 still describe the visible text.
        const kept: { value: string; sourceIndex: number; breakBefore: boolean }[] = [];
        let breakBeforeNext = false;
        fields.forEach((text, index) => {
            const value = text || "";
            const slotBreak = key === "subtitle" && Boolean(props.subtitleBreaks?.includes(index));
            if (props.readOnly && value.trim().length === 0) {
                breakBeforeNext = breakBeforeNext || slotBreak;
                return;
            }

            kept.push({
                value,
                sourceIndex: index,
                breakBefore: Boolean(props.readOnly) && breakBeforeNext
            });
            breakBeforeNext = false;
        });

        return kept.map((field, visibleIndex) => {
            const classIndex = props.readOnly ? visibleIndex : field.sourceIndex;
            const classCount = props.readOnly ? kept.length : fields.length;
            const lineBreak = key === "subtitle" && props.subtitleBreaks?.includes(field.sourceIndex)
                ? <hr style={{ flexBasis: "100%", border: 0 }} />
                : null;
            const carriedBreak = field.breakBefore
                ? <hr style={{ flexBasis: "100%", border: 0 }} />
                : null;
            const canDelete = key === "subtitle" || fields.length > 1;
            const textFieldOptions = canDelete ? [
                {
                    text: `Delete "${field.value}"`,
                    onClick: () => deleter(key, field.sourceIndex)
                }
            ] : [];

            return <React.Fragment key={`${field.sourceIndex}/${fields.length}`}>
                {carriedBreak}
                <TextField
                    displayClassName={getFieldClassName(classIndex, classCount)}
                    static={!isSelected}
                    startEditing={newField?.key === key && newField.index === field.sourceIndex}
                    onChange={(data: string) => updater(key, field.sourceIndex, data)}
                    value={field.value}
                    defaultText="Enter a value"
                    readOnly={props.readOnly}
                    displayProcessors={[process, toUrl]}
                    contextMenuOptions={props.readOnly ? [] : [...textFieldOptions, ...actions.map(action => ({ text: action.label, onClick: action.run }))]}
                />
                {lineBreak}
            </React.Fragment>;
        });
    }

    /** hgroup onclick stops event from bubbling up to resume */
    return (
        <Container
            {...props}
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
                </h3>
                {(!props.readOnly || props.subtitle?.some(text => text.trim().length > 0)) && <h4 className="subtitle">
                    {getFields('subtitle')}
                </h4>}
            </hgroup>
            {isSelected && !props.readOnly && <div className="entry-field-actions no-print app-gap-2 app-mt-2">
                <FieldAdder label="Add title" onAdd={() => addField('title')} />
                <FieldAdder label="Add detail" onAdd={() => addField('subtitle')} />
                {actions.map(action => <Button key={action.id} onClick={event => {
                    event.stopPropagation(); action.run();
                }}>{action.label}</Button>)}
            </div>}
            {props.children}
        </Container>
    );
}

Entry.type = 'Entry';
