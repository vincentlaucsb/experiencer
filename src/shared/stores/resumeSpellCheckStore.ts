/**
 * Owns whether résumé text fields ask the browser to check spelling.
 *
 * The editor uses the browser's native spellchecker, so marks exist only on
 * editing controls and never reach rendered or exported documents. Hosts that
 * offer a preference UI own its persistence and forward the value here.
 */
export class ResumeSpellCheckStore {
    private enabled = true;
    private readonly listeners = new Set<() => void>();

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };

    getSnapshot = () => this.enabled;

    setEnabled = (enabled: boolean) => {
        if (enabled === this.enabled) return;
        this.enabled = enabled;
        this.listeners.forEach(listener => listener());
    };
}

export const resumeSpellCheckStore = new ResumeSpellCheckStore();
