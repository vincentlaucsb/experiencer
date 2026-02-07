import RichText from "@/resume/RichText";
import { BasicResumeNode } from "@/shared/utils/Types";

/**
    * Construct a bulleted list
    * @param items A list of items
    */
export function makeList(items: Array<string>): BasicResumeNode {
    let value = "";
    items.forEach((i) => {
        value += `<li>${i}</li>`
    });

    return {
        type: RichText.type,
        value: `<ul>${value}</ul>`
    };
}