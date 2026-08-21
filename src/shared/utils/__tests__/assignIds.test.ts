import { assignIds } from '@/shared/utils/assignIds';
import { BasicResumeNode } from '@/types';

describe('assignIds', () => {
    it('preserves only unique, non-empty GUID identities', () => {
        const duplicate = '11111111-1111-4111-8111-111111111111';
        const nodes = assignIds([
            {
                type: 'Section',
                uuid: duplicate,
                childNodes: [
                    { type: 'Markdown', uuid: duplicate },
                    { type: 'Markdown', uuid: 'not-a-guid' },
                    { type: 'Markdown', uuid: '00000000-0000-0000-0000-000000000000' },
                ],
            } as BasicResumeNode,
        ]);

        const ids = [nodes[0].uuid, ...(nodes[0].childNodes ?? []).map((node) => node.uuid)];
        expect(ids[0]).toBe(duplicate);
        expect(new Set(ids.map((id) => id.toLowerCase())).size).toBe(ids.length);
        expect(ids).not.toContain('not-a-guid');
        expect(ids).not.toContain('00000000-0000-0000-0000-000000000000');
    });
});
