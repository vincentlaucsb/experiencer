import MappedTextFields, { type ContainerProps } from "@/controls/inputs/MappedTextFields";
import CssActionButton from "@/editor/CssActionButton";
import CssSuggestions from "@/editor/CssSuggestions";
import { AddIcon } from "@/controls/InterfaceIcons";
import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import { getCssDeclarationError } from '@/shared/utils/transformResumeStylesheet';

interface CssPropertyEditorProps {
    commands: CssEditorCommands;
    cssNode: ReadonlyCssNode;
    path: ReadonlyArray<string>;
    varSuggestions?: Array<string>;
}

/** Renders one CSS block's declarations with the existing validation and suggestions. */
export default function CssPropertyEditor({
    commands,
    cssNode,
    path,
    varSuggestions
}: CssPropertyEditorProps) {
    const mapContainer = (props: ContainerProps) => (
        <div className="css-rule-body">
            <div className="css-declarations app-ml-4">{props.children}</div>
            <div className="css-rule-end app-gap-2">
                {"}"}
                <CssActionButton label="Add property" onClick={props.onClick}><AddIcon /></CssActionButton>
            </div>
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
            genericValueSuggestions={varSuggestions}
            valueSuggestions={cssSuggestions}
        />
    );
}
