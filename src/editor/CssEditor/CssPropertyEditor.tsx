import MappedTextFields, { type ContainerProps } from "@/controls/inputs/MappedTextFields";
import TextField from "@/controls/inputs/TextField";
import CssSuggestions from "@/editor/CssSuggestions";
import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";

interface CssPropertyEditorProps {
    commands: CssEditorCommands;
    cssNode: ReadonlyCssNode;
    path: ReadonlyArray<string>;
    varSuggestions?: Array<string>;
}

/** Adapts one CSS rule's selector and declarations to editable text fields. */
export default function CssPropertyEditor({
    commands,
    cssNode,
    path,
    varSuggestions
}: CssPropertyEditorProps) {
    const mapContainer = (props: ContainerProps) => {
        const selectorDisplay = (
            <span onClick={(event) => event.stopPropagation()}>
                <TextField
                    value={cssNode.selector || ""}
                    displayValue={cssNode.fullSelector}
                    displayClassName="css-description"
                    onChange={(text) => commands.updateSelector(path, text)}
                />
            </span>
        );

        return (
            <div className="css-ruleset" onClick={props.onClick}>
                <span className="css-description app-mt-4">{selectorDisplay}</span> {"{"}
                <table className="css-ruleset-table app-ml-4">
                    <tbody>
                        {props.children}
                    </tbody>
                </table>
                {"}"}
            </div>
        );
    };

    const cssSuggestions = CssSuggestions.properties;
    const genericValueSuggestions = varSuggestions || [];

    // Preserve the existing ineffective expression until its behavior is changed deliberately.
    genericValueSuggestions.concat(["initial", "inherit", "unset"]);

    return (
        <MappedTextFields
            value={cssNode.properties as Map<string, string>}
            container={mapContainer}
            updateValue={commands.updateProperty.bind(null, path)}
            deleteKey={commands.deleteKey.bind(null, path)}
            keySuggestions={Array.from(cssSuggestions.keys())}
            genericValueSuggestions={genericValueSuggestions}
            valueSuggestions={cssSuggestions}
        />
    );
}
