import ComponentTypes from '@/resume/schema/ComponentTypes';
import type { ResumeNode } from '@/types';

/** Derives bounded text-only labels without modifying authored document content. */
export function nodeTreeLabel(node: ResumeNode): { short: string; full: string } {
    let type = node.type;
    try { type = ComponentTypes.instance.defaultValue(node.type).text; } catch { /* Unknown imported nodes retain their structural name. */ }
    const representation = ComponentTypes.instance.treeRepresentation(node);
    const content = typeof representation === 'string' && representation !== type && representation !== node.type
        ? representation : typeof node.value === 'string' ? node.value : '';
    const snippet = content.replace(/<[^>]*>/g, '').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim();
    const full = snippet ? `${type}: ${snippet}` : node.childNodes?.length ? type : `${type} (empty)`;
    return { full, short: snippet.length > 48 ? `${type}: ${snippet.slice(0, 47)}…` : full };
}
