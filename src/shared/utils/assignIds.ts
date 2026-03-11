import { v4 as uuid } from 'uuid';
import { BasicResumeNode, ResumeNode } from '@/types';

function assignIdsToNodeArray(children: Array<BasicResumeNode | ResumeNode>) {
    let workQueue = [children];
    while (workQueue.length) {
        let nextItem = workQueue.pop() as Array<BasicResumeNode | ResumeNode>;
        nextItem.forEach((elem) => {
            (elem as any)['uuid'] = uuid();
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

    nodeOrArray['uuid'] = uuid();
    const children = nodeOrArray.childNodes;
    if (children) {
        assignIdsToNodeArray(children);
    }

    return nodeOrArray as unknown as ResumeNode;
}
