import {
    mergeResumeAppExtensions,
    resolveResumeAppExtensions
} from '@/app/ResumeAppContracts';

test('prefers state-owned extension groups over compatibility props', () => {
    const extensions = resolveResumeAppExtensions({
        stylesheet: '',
        tree: { type: 'Resume', uuid: 'root', childNodes: [] },
        proBadge: 'flat',
        landingClassName: 'flat-landing',
        additionalSidebarTabs: [{ key: 'Flat', content: null }],
        extensions: {
            shell: { proBadge: 'grouped' },
            landing: { landingClassName: 'grouped-landing' }
        }
    });

    expect(extensions.shell?.proBadge).toBe('grouped');
    expect(extensions.landing?.landingClassName).toBe('grouped-landing');
    expect(extensions.editor?.additionalSidebarTabs).toEqual([{ key: 'Flat', content: null }]);
});

test('merges hosted extension groups under caller overrides', () => {
    expect(mergeResumeAppExtensions(
        { shell: { accountLabel: 'Hosted', proBadge: 'Pro' } },
        { shell: { accountLabel: 'Override' } }
    )).toEqual({
        shell: { accountLabel: 'Override', proBadge: 'Pro' },
        editor: {},
        documentOpening: {},
        landing: {},
        templates: {}
    });
});
