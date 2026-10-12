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
    test('uses the longest column flow rather than summing parallel breaks', () => {
        const column = (breaks: number): ResumeNode => ({ ...createNode('Column'),
            childNodes: Array.from({ length: breaks }, () => createNode('PageBreak')) });
        expect(getResumeMinHeight([column(1), column(1)], PageSize.Letter)).toBe('22in');
        expect(getResumeMinHeight([column(1), column(2)], PageSize.A4)).toBe('891mm');
        expect(getResumeMinHeight([column(1), createNode('PageBreak'), column(1)], PageSize.Letter)).toBe('44in');
        expect(getResumeMinHeight([{ ...createNode('Row'), childNodes: [column(1), column(1)] },
            createNode('PageBreak')], PageSize.Letter)).toBe('33in');
        expect(getResumeMinHeight([
            { ...createNode('Row'), childNodes: [column(1), column(1)] },
            { ...createNode('Row'), childNodes: [column(1)] }
        ], PageSize.Letter)).toBe('33in');
    });
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
