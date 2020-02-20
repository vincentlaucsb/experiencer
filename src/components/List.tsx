import * as React from "react";
import TextField from "./controls/inputs/TextField";
import Container from "./Container";
import { process, deleteAt, moveUp, moveDown } from "./Helpers";
import ResumeComponentProps, { BasicResumeNode } from "./utility/Types";
import Popover from "react-tiny-popover";

interface DescriptionItemBase {
    term?: string;
    definitions?: string[];
}

export interface BasicDescriptionItemProps extends BasicResumeNode, DescriptionItemBase { };
interface DescriptionItemProps extends DescriptionItemBase, ResumeComponentProps { }

interface DescriptionItemState {
    activeIndex: number;
}

export class DescriptionListItem extends React.Component<DescriptionItemProps, DescriptionItemState> {
    static readonly type = 'Description List Item';

    constructor(props) {
        super(props);

        this.state = {
            activeIndex: -1
        };
    }

    getDefinitions() {
        const moveFieldUp = (index: number) => {
            this.props.updateData('definitions',
                moveUp(this.props.definitions || [], index)
            );
        };

        const moveFieldDown = (index: number) => {
            this.props.updateData('definitions',
                moveUp(this.props.definitions || [], index)
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
            return fields.map((text: string, index: number, arr: string[]) => {
                return <dd key={`${index}/${arr.length}`}
                    onMouseEnter={() => this.setState({ activeIndex: index })}
                    onMouseLeave={() => this.setState({ activeIndex: -1 })}>
                    <Popover
                        containerClassName="options-popover"
                        isOpen={this.state.activeIndex === index}
                        position={['right', 'left']}
                        content={<div>
                            <button
                                onClick={(event: React.MouseEvent) => {
                                    moveFieldUp(index);
                                    event.stopPropagation();
                                }}
                            ><i className="icofont-arrow-up" /></button>
                            <button
                                onClick={(event: React.MouseEvent) => {
                                    moveFieldDown(index);
                                    event.stopPropagation();
                                }}
                            ><i className="icofont-arrow-down" /></button>
                            <button
                                onClick={(event: React.MouseEvent) => {
                                    deleteField(index);
                                    event.stopPropagation();
                                }}
                            ><i className="icofont-ui-delete" /></button>
                        </div>}
                    >
                        <TextField
                            static={!this.props.isSelected}
                            onChange={(data: string) => updater(index, data)}
                            value={text}
                            defaultText="Enter a value"
                            displayProcessors={[process]}
                            />
                    </Popover>
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