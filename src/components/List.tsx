import * as React from "react";
import TextField from "./controls/inputs/TextField";
import Container from "./Container";
import { process, deleteAt } from "./Helpers";
import ResumeComponentProps, { BasicResumeNode } from "./utility/Types";

interface DescriptionItemBase {
    term?: string;
    definitions?: string[];
}

export interface BasicDescriptionItemProps extends BasicResumeNode, DescriptionItemBase { };
interface DescriptionItemProps extends DescriptionItemBase, ResumeComponentProps { }

export class DescriptionListItem extends React.PureComponent<DescriptionItemProps> {
    static readonly type = 'Description List Item';
    
    getDefinitions() {
        const deleteField = (index: number) => {
            console.log("Deleter called");
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
            return fields.map((text: string, index: number, arr: string[]) => {
                return <dd key={`${index}/${arr.length}`}>
                    <TextField
                        delete={() => deleteField(index)}
                        static={!this.props.isSelected}
                        onChange={(data: string) => updater(index, data)}
                        value={text}
                        defaultText="Enter a value"
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