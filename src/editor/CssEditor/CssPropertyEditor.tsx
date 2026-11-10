import MappedTextFields, { type ContainerProps } from "@/controls/inputs/MappedTextFields";
import { Button } from "@/controls/Buttons";
import CssSuggestions from "@/editor/CssSuggestions";
import { AddIcon } from "@/controls/InterfaceIcons";
import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import { getCssDeclarationError } from '@/shared/utils/transformResumeStylesheet';

interface CssPropertyEditorProps {
    commands: CssEditorCommands;
    cssNode: ReadonlyCssNode;
    path: ReadonlyArray<string>;
    getVariables?: () => string[];
}

/** Renders one CSS block's declarations with the existing validation and suggestions. */
export default function CssPropertyEditor({
    commands,
    cssNode,
    path,
    getVariables
}: CssPropertyEditorProps) {
    const mapContainer = (props: ContainerProps) => (
        <div className="css-rule-body">
            <div className="css-declarations app-ml-4">{props.children}</div>
            <Button ref={props.addButtonRef} type="button" className="css-rule-end app-gap-2"
                aria-label="Add property" onClick={props.onClick}>
                <span aria-hidden="true">{"}"}</span>
                <span className="css-add-property-icon" aria-hidden="true"><AddIcon /></span>
            </Button>
        </div>
    );
    const cssSuggestions = CssSuggestions.properties;

    return (
        <MappedTextFields
            layout="declarations"
            value={cssNode.properties as Map<string, string>}
            container={mapContainer}
            updateValue={commands.updateProperty.bind(null, path)}
            validateValue={getCssDeclarationError}
            deleteKey={commands.deleteKey.bind(null, path)}
            keySuggestions={Array.from(cssSuggestions.keys())}
            getVariables={getVariables}
            valueSuggestions={cssSuggestions}
        />
    );
}
