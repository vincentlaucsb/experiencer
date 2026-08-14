import * as React from 'react';

import PngExportModal from '@/controls/PngExportModal';
import { pngExportStore } from '@/shared/stores/pngExportStore';

/** Bridges the framework-neutral PNG export store into the export modal. */
export default function PngExportFeature() {
    const snapshot = React.useSyncExternalStore(
        pngExportStore.subscribe,
        pngExportStore.getSnapshot,
        pngExportStore.getSnapshot
    );

    React.useEffect(() => () => pngExportStore.close(), []);

    return (
        <PngExportModal
            isOpen={snapshot.phase !== 'idle'}
            phase={snapshot.phase === 'idle' ? 'loading' : snapshot.phase}
            imageUrl={snapshot.imageUrl}
            errorMessage={snapshot.errorMessage}
            copyPhase={snapshot.copyPhase}
            onClose={pngExportStore.close}
            onCopy={() => void pngExportStore.copy()}
            onDownload={pngExportStore.download}
        />
    );
}
