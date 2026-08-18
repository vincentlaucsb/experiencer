import { ResumeAppExtensionsStore } from '@/shared/stores/resumeAppExtensionsStore';

test('publishes extension groups to subscribers', () => {
    const store = new ResumeAppExtensionsStore();
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    store.setLanding({ landingClassName: 'pro-landing' });
    store.setShell({ accountLabel: 'Ada' });

    expect(store.getSnapshot()).toEqual({
        landing: { landingClassName: 'pro-landing' },
        shell: { accountLabel: 'Ada' }
    });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.setEditor({ additionalSidebarTabs: [] });
    expect(listener).toHaveBeenCalledTimes(2);
});

test('does not notify when a group is unchanged', () => {
    const store = new ResumeAppExtensionsStore();
    const listener = jest.fn();
    store.subscribe(listener);

    const landing = { landingClassName: 'pro-landing' };
    store.setLanding(landing);
    store.setLanding({ landingClassName: 'pro-landing' });
    store.replace({
        landing: { landingClassName: 'pro-landing' }
    });

    expect(listener).toHaveBeenCalledTimes(1);
});
