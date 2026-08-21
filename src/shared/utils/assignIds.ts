import { BasicResumeNode, ResumeNode } from '@/types';
import createUuid from '@/shared/utils/createUuid';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function preserveOrCreateUuid(
    candidate: string | undefined,
    replaceExisting: boolean,
    assignedIds: Set<string>
) {
    const normalized = candidate?.toLowerCase();
    if (
        !replaceExisting &&
        normalized &&
        normalized !== '00000000-0000-0000-0000-000000000000' &&
        uuidPattern.test(normalized) &&
        !assignedIds.has(normalized)
    ) {
        assignedIds.add(normalized);
        return candidate!;
    }

    let generated = createUuid();
    while (assignedIds.has(generated.toLowerCase())) {
        generated = createUuid();
    }
    assignedIds.add(generated.toLowerCase());
    return generated;
}

function assignIdsToNodeArray(
    children: Array<BasicResumeNode | ResumeNode>,
    replaceExisting: boolean,
    assignedIds: Set<string>
) {
    let workQueue = [children];
    while (workQueue.length) {
        let nextItem = workQueue.pop() as Array<BasicResumeNode | ResumeNode>;
        nextItem.forEach((elem) => {
            elem.uuid = preserveOrCreateUuid(elem.uuid, replaceExisting, assignedIds);
            if (elem.childNodes) {
                workQueue.push(elem.childNodes as any);
            }
        });
    }
}

export function assignIds(nodeOrArray: BasicResumeNode): ResumeNode;
export function assignIds(nodeOrArray: Array<BasicResumeNode>): Array<ResumeNode>;
export function assignIds(nodeOrArray: BasicResumeNode | Array<BasicResumeNode>) {
    const assignedIds = new Set<string>();
    if (nodeOrArray instanceof Array) {
        assignIdsToNodeArray(nodeOrArray, false, assignedIds);
        return nodeOrArray as unknown as Array<ResumeNode>;
    }

    nodeOrArray.uuid = preserveOrCreateUuid(nodeOrArray.uuid, false, assignedIds);
    const children = nodeOrArray.childNodes;
    if (children) {
        assignIdsToNodeArray(children, false, assignedIds);
    }

    return nodeOrArray as unknown as ResumeNode;
}

/** Assigns new identities to an intentional copy so it cannot collide with its source tree. */
export function assignFreshIds(node: BasicResumeNode): ResumeNode {
    const assignedIds = new Set<string>();
    node.uuid = preserveOrCreateUuid(undefined, true, assignedIds);
    if (node.childNodes) {
        assignIdsToNodeArray(node.childNodes, true, assignedIds);
    }
    return node as ResumeNode;
}
