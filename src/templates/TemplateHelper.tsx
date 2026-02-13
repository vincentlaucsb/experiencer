import MarkdownText from "@/resume/Markdown";
import { BasicResumeNode } from "@/types";

/**
    * Construct a bulleted list
    * @param items A list of items
    */
export function makeList(items: Array<string>): BasicResumeNode {
    let value = items.map(item => `- ${item}`).join('\n');

    return {
        type: MarkdownText.type,
        value
    };
}