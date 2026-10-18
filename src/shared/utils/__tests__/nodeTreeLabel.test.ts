import registerNodes from '@/resume/schema';
import { nodeTreeLabel } from '../nodeTreeLabel';
import type { ResumeNode } from '@/types';

beforeAll(registerNodes);

test('contact text and skill terms retain their structural types with readable snippets', () => {
    expect(nodeTreeLabel({ type: 'Markdown', uuid: 'text', value: '[Portfolio](https://portfolio.example)' } as ResumeNode))
        .toEqual({ short: 'Text: Portfolio', full: 'Text: Portfolio' });
    expect(nodeTreeLabel({ type: 'Description List Item', uuid: 'skill', value: 'TypeScript' } as ResumeNode).short)
        .toBe('Description List Item: TypeScript');
});

test('empty and long labels are useful, bounded, and leave document content untouched', () => {
    expect(nodeTreeLabel({ type: 'Markdown', uuid: 'empty' } as ResumeNode).short).toBe('Text (empty)');
    const node = { type: 'Markdown', uuid: 'long', value: '<script>discard()</script> ' + 'Long contact '.repeat(20) } as ResumeNode;
    const original = node.value;
    const label = nodeTreeLabel(node);
    expect(label.short.length).toBeLessThanOrEqual(54);
    expect(label.full.length).toBeGreaterThan(label.short.length);
    expect(label.full).not.toContain('<');
    expect(node.value).toBe(original);
    node.value = 'New label';
    expect(nodeTreeLabel(node).short).toBe('Text: New label');
});
