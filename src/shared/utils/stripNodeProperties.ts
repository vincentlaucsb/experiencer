import { BasicResumeNode, ResumeNode } from '@/types';

export function stripNodeProperties(
    nodes: Array<ResumeNode>,
    keys: ReadonlyArray<keyof ResumeNode>
): Array<BasicResumeNode> {
    return nodes.map((node) => {
        const result = { ...node } as Record<string, unknown>;
        for (const key of keys) {
            delete result[key as string];
        }
        if (result['childNodes']) {
            result['childNodes'] = stripNodeProperties(
                result['childNodes'] as Array<ResumeNode>,
                keys
            );
        }
        return result as unknown as BasicResumeNode;
    });
}
