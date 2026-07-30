import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { workspaceStore } from './workspaceStore';

interface PrintState {
    isPrinting: boolean;
    setPrinting: (isPrinting: boolean) => void;
}

export const usePrintStore = create<PrintState>()(
    devtools(
        (set) => ({
            isPrinting: false,
            setPrinting: (isPrinting: boolean) =>
                set({ isPrinting }, false, 'setPrinting')
        }),
        { name: 'PrintStore' }
    )
);

export const useIsPrinting = () => usePrintStore((state) => state.isPrinting);

// Sync print state with editor mode
// Subscribe to mode changes and update isPrinting accordingly
workspaceStore.subscribe(() => {
    const isPrintMode = workspaceStore.getSnapshot().mode === 'printing';
    const currentPrintState = usePrintStore.getState().isPrinting;
    
    if (isPrintMode !== currentPrintState) {
        usePrintStore.getState().setPrinting(isPrintMode);
    }
});
