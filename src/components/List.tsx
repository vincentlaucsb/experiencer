import * as React from "react";
import TextField from "./controls/inputs/TextField";
import Container from "./Container";
import { process, deleteAt, moveUp, moveDown } from "./Helpers";
import ResumeComponentProps, { BasicResumeNode } from "./utility/Types";
import ResumeContext, { IResumeContext } from "./ResumeContext";

interface DescriptionItemBase {
    term?: string;
    definitions?: string[];
}

export interface BasicDescriptionItemProps extends BasicResumeNode, DescriptionItemBase { };
interface DescriptionItemProps extends DescriptionItemBase, ResumeComponentProps { }

export const DescriptionListItemType = "Description List Item";

/** Helper function for DescriptionListItem */
function getDefinitions(props: DescriptionItemProps, context: IResumeContext) {
    const moveFieldUp = (index: number) => {
        props.updateData('definitions', moveUp(props.definitions || [], index));
    };

    const moveFieldDown = (index: number) => {
        props.updateData('definitions', moveDown(props.definitions || [], index));
    };

    const deleteField = (index: number) => {
        props.updateData('definitions', deleteAt(props.definitions || [], index));
    };

    const updater = (index: number, text: string) => {
        let replDefs = props.definitions || [];

        // Replace contents
        replDefs[index] = text;
        props.updateData('definitions', replDefs);
    }

    const fields = props.definitions;
    if (fields) {
        const isSelected = context.selectedUuid === props.uuid;

        return fields.map((text: string, index: number, arr: string[]) => {
            const definitionOptions = [
                {
                    text: 'Delete',
                    action: () => deleteField(index)
                },
                {
                    text: 'Move Up',
                    action: () => moveFieldUp(index)
                },
                {
                    text: 'Move Down',
                    action: () => moveFieldDown(index)
                }
            ];

            return <dd key={`${index}/${arr.length}`}>
                <TextField
                    static={!isSelected}
                    onChange={(data: string) => updater(index, data)}
                    value={text}
                    defaultText="Enter a value"
                    contextMenuOptions={definitionOptions}
                    displayProcessors={[process]}
                />
            </dd>
        });
    }

    return <></>
}

export function DescriptionListItem(props: DescriptionItemProps) {
    const term = <TextField
        label="Term"
        onChange={(text: string) => { props.updateData("value", text) }}
        value={props.value}
        defaultText="Enter a term"
        displayProcessors={[process]}
    />

    return <ResumeContext.Consumer>
        {(context) => {
            return (
                <Container {...props} className="resume-definition">
                    <dt>{term}</dt>
                    {getDefinitions(props, context)}
                </Container>
            );
        }}
    </ResumeContext.Consumer>
}

export const DescriptionListType = "Description List";

export default function DescriptionList(props: ResumeComponentProps) {
    return <Container displayAs="dl" {...props}>
        {props.children}
    </Container>
}