import Group from "@/resume/Group";

/** Legacy alias kept for backward compatibility with older saved resumes */
export default class Divider extends Group {
    static readonly type: string = "Divider";
}