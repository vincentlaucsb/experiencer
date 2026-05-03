import { BasicResumeNode, ResumeNode } from '@/types';
import createUuid from '@/shared/utils/createUuid';

function assignIdsToNodeArray(children: Array<BasicResumeNode | ResumeNode>) {
    let workQueue = [children];
    while (workQueue.length) {
        let nextItem = workQueue.pop() as Array<BasicResumeNode | ResumeNode>;
        nextItem.forEach((elem) => {
            (elem as any)['uuid'] = createUuid();
            if (elem.childNodes) {
                workQueue.push(elem.childNodes as any);
            }
        });
    }
}

export function assignIds(nodeOrArray: BasicResumeNode): ResumeNode;
export function assignIds(nodeOrArray: Array<BasicResumeNode>): Array<ResumeNode>;
export function assignIds(nodeOrArray: BasicResumeNode | Array<BasicResumeNode>) {
    if (nodeOrArray instanceof Array) {
        assignIdsToNodeArray(nodeOrArray);
        return nodeOrArray as unknown as Array<ResumeNode>;
    }

    nodeOrArray['uuid'] = createUuid();
    const children = nodeOrArray.childNodes;
    if (children) {
        assignIdsToNodeArray(children);
    }

    return nodeOrArray as unknown as ResumeNode;
}
