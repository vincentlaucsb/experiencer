import CssNode from '@/shared/CssTree';
import { getInspectableCssRules, resolveCssRuleTarget } from '@/shared/utils/cssRuleInspection';

test('canonical rule text retains owner paths, duplicate selectors, and propertyless categories', () => {
    const root = new CssNode('Variables', { '--ink': 'black' }, ':root');
    const css = new CssNode('Resume', {}, 'body');
    const group = css.addNode('Group', {}, '');
    group.addNode('First', { color: 'red' }, '.entry');
    group.addNode('Second', { color: 'blue' }, '.entry');
    const rules = getInspectableCssRules(css, root);
    expect(rules.map(rule => rule.path)).toEqual([[], ['Group', 'First'], ['Group', 'Second']]);
    expect(rules.slice(1).map(rule => rule.stylesheet).join('\n\n')).toBe(css.stylesheet());
    expect(resolveCssRuleTarget(rules[2].target, css, root)).toEqual({
        tree: 'resume', node: group, expandedPath: ['Group', 'Second']
    });
    expect(resolveCssRuleTarget(rules[0].target, css, root)?.node).toBe(root);
    expect(resolveCssRuleTarget(rules[2].target, css.deepCopy(), root)).toBeUndefined();
    css.deleteNode(['Group', 'Second']);
    expect(resolveCssRuleTarget(rules[2].target, css, root)).toBeUndefined();
});

test('renames rekey addresses without changing cascade order, including descendant paths', () => {
    const css = new CssNode('Resume', {}, 'body');
    const root = new CssNode('Variables', {}, ':root');
    const first = css.addNode('First', { color: 'red' }, '.entry');
    const nested = first.addNode('Nested', { color: 'green' }, 'span');
    css.addNode('Second', { color: 'blue' }, '.entry');
    const original = css.stylesheet();
    first.name = 'Renamed';
    nested.name = 'Child';
    expect(css.stylesheet()).toBe(original);
    const rules = getInspectableCssRules(css, root);
    expect(rules.map(rule => rule.path)).toEqual([['Renamed'], ['Renamed', 'Child'], ['Second']]);
    expect(resolveCssRuleTarget(rules[1].target, css, root)?.node).toBe(first);
    expect(css.findNode(['First'])).toBeUndefined();
    expect(css.hasName('First')).toBe(false);
    expect(css.hasName('Renamed')).toBe(true);
    expect(() => { first.name = 'Second'; }).toThrow('Already have a child named Second');
    expect(css.findNode('Renamed')).toBe(first);
});
