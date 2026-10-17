import TextField, { type TextFieldProps } from "@/controls/inputs/TextField";
import { useResumeSpellCheck } from "@/shared/stores/resumeSpellCheckHooks";

/** A résumé prose field that follows the editor's spellcheck preference. */
export default function ResumeTextField(props: Omit<TextFieldProps, "spellCheck">) {
    return <TextField {...props} spellCheck={useResumeSpellCheck()} />;
}
