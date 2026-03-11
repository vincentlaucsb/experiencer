import getResumeMinHeight from '@/shared/utils/getResumeMinHeight';
import PageSize from '@/types/PageSize';
import { ResumeNode } from '@/types';

let nodeCounter = 0;

function createNode(type: string): ResumeNode {
    nodeCounter += 1;
    return {
        type,
        uuid: `${type}-${nodeCounter}`
    };
}

describe('getResumeMinHeight', () => {
    beforeEach(() => {
        nodeCounter = 0;
    });

    test('returns one page height for letter when there are no page breaks', () => {
        const nodes: ResumeNode[] = [
            createNode('Header'),
            createNode('Section')
        ];

        expect(getResumeMinHeight(nodes, PageSize.Letter)).toBe('11in');
    });

    test('returns two letter pages when there is one page break', () => {
        const nodes: ResumeNode[] = [
            createNode('Header'),
            createNode('PageBreak'),
            createNode('Section')
        ];

        expect(getResumeMinHeight(nodes, PageSize.Letter)).toBe('22in');
    });

    test('returns three A4 pages when there are two page breaks', () => {
        const nodes: ResumeNode[] = [
            createNode('PageBreak'),
            createNode('Section'),
            createNode('PageBreak')
        ];

        expect(getResumeMinHeight(nodes, PageSize.A4)).toBe('891mm');
    });
});
