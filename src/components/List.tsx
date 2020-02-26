import * as React from "react";
import TextField from "./controls/inputs/TextField";
import Container from "./Container";
import { process, deleteAt, moveUp, moveDown } from "./Helpers";
import ResumeComponentProps, { BasicResumeNode } from "./utility/Types";
import ResumeContext from "./ResumeContext";

interface DescriptionItemBase {
    term?: string;
    definitions?: string[];
}

export interface BasicDescriptionItemProps extends BasicResumeNode, DescriptionItemBase { };
interface DescriptionItemProps extends DescriptionItemBase, ResumeComponentProps { }

interface DescriptionItemState {
    activeIndex: number;
}

export class DescriptionListItem extends React.PureComponent<DescriptionItemProps, DescriptionItemState> {
    static contextType = ResumeContext;
    static readonly type = 'Description List Item';

    getDefinitions() {
        const moveFieldUp = (index: number) => {
            this.props.updateData('definitions',
                moveUp(this.props.definitions || [], index)
            );
        };

        const moveFieldDown = (index: number) => {
            this.props.updateData('definitions',
                moveDown(this.props.definitions || [], index)
            );
        };

        const deleteField = (index: number) => {
            this.props.updateData('definitions',
                deleteAt(this.props.definitions || [], index)
            );
        };

        const updater = (index: number, text: string) => {
            let replDefs = this.props.definitions || [];

            // Replace contents
            replDefs[index] = text;
            this.props.updateData('definitions', replDefs);
        }

        const fields = this.props.definitions;
        if (fields) {
            const isSelected = this.context.selectedUuid === this.props.uuid;

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

    render() {
        const term = <TextField
            label="Term"
            onChange={this.props.updateData.bind(this, "value")}
            value={this.props.value}
            defaultText="Enter a term"
            displayProcessors={[process]}
        />

        return <Container {...this.props} className="resume-definition">
            <dt>{term}</dt>
            {this.getDefinitions()}
        </Container>
    }
}

export default class DescriptionList extends React.PureComponent<ResumeComponentProps> {
    static readonly type = 'Description List';

    render() {
        return <Container displayAs="dl" {...this.props}>
            {this.props.children}
        </Container>
    }
}