import * as React from 'react';
import TextField from '@/controls/inputs/TextField';
import Container from '@/resume/infrastructure/Container';
import { process } from '@/shared/utils/processText';
import ResumeComponentProps from '@/types';
import { useEditorStore, useIsNodeEditing, useIsNodeSelected } from '@/shared/stores/editorStore';

/** Renders a titled resume section with an immediately focusable title editor. */
export default function Section(props: ResumeComponentProps) {
    const isEditing = useIsNodeEditing(props.uuid) && !props.readOnly;
    const isSelected = useIsNodeSelected(props.uuid) && !props.readOnly;
    const title = <TextField onChange={value => props.updateData('value', value)} value={props.value || ''}
        ariaLabel="Section title" startEditing={isEditing} static={!isSelected}
        onEditingEnd={() => useEditorStore.getState().finishEditingNode(props.uuid)}
        defaultText="Enter a title" displayProcessors={[process]} readOnly={props.readOnly} />;
    return <Container displayAs="section" {...props}>
        <h2 onClick={props.readOnly ? undefined : event => {
            event.stopPropagation();
            useEditorStore.getState().editNode(props.uuid);
        }}>{title}</h2>
        <div className="content">
            {props.children}
            {!props.readOnly && React.Children.count(props.children) === 0
                && <p>This section is empty. Click here to select it and add content.</p>}
        </div>
    </Container>;
}

Section.type = 'Section';
