import Group from "@/resume/Group";

/** Keeps the legacy Divider node type loadable as a generic group. */
export default class Divider extends Group {
    static readonly type: string = "Divider";
}
