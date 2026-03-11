import TextField from "@/controls/inputs/TextField";
import { deleteAt, moveUp, moveDown } from "@/shared/utils/arrayHelpers";
import { process } from "@/shared/utils/processText";
import ResumeComponentProps, { BasicResumeNode } from "@/types";
import { useEditorStore } from "@/shared/stores/editorStore";
import Container from "@/resume/infrastructure/Container";

interface DescriptionItemBase {
    term?: string;
    definitions?: string[];
}

export interface BasicDescriptionItemProps extends BasicResumeNode, DescriptionItemBase { };
interface DescriptionItemProps extends DescriptionItemBase, ResumeComponentProps { }

export const DescriptionListItemType = "Description List Item";

/** Helper function for DescriptionListItem */
function getDefinitions(props: DescriptionItemProps, isSelected: boolean) {
    const moveFieldUp = (index: number) => {
        const definitions = props.definitions || [];
        moveUp(definitions, index);
        props.updateData('definitions', definitions);
    };

    const moveFieldDown = (index: number) => {
        const definitions = props.definitions || [];
        moveDown(definitions, index);
        props.updateData('definitions', definitions);
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

        return fields.map((text: string, index: number, arr: string[]) => {
            const definitionOptions = [
                {
                    text: 'Delete',
                    onClick: () => deleteField(index)
                },
                {
                    text: 'Move Up',
                    onClick: () => moveFieldUp(index)
                },
                {
                    text: 'Move Down',
                    onClick: () => moveFieldDown(index)
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
    const isSelected = useEditorStore(state => state.selectedNodeId === props.uuid);

    const term = <TextField
        label="Term"
        onChange={(text: string) => { props.updateData("value", text) }}
        value={props.value}
        defaultText="Enter a term"
        displayProcessors={[process]}
    />

    return (
        <Container {...props} className="resume-definition">
            <dt>{term}</dt>
            {getDefinitions(props, isSelected)}
        </Container>
    );
}

export const DescriptionListType = "Description List";

export default function DescriptionList(props: ResumeComponentProps) {
    return <Container displayAs="dl" {...props}>
        {props.children}
    </Container>
}