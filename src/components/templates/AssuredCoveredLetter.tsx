import { BasicResumeNode } from "../utility/Types";
import { assuredHeader } from "./Assured";
import Column from "../Column";
import RichText from "../RichText";

export function assuredCoverLetterNodes(): Array<BasicResumeNode> {
    return [
        assuredHeader(),
        {
            type: Column.type,
            childNodes: [
                {
                    type: RichText.type,
                    value: "To whom it may concern,"
                },
                {
                    type: RichText.type,
                    value: "Sincerely, Joe Blow"
                }
            ]
        }
    ];
}