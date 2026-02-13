import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useEditorStore } from './editorStore';

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
useEditorStore.subscribe((state) => {
    const isPrintMode = state.mode === 'printing';
    const currentPrintState = usePrintStore.getState().isPrinting;
    
    if (isPrintMode !== currentPrintState) {
        usePrintStore.getState().setPrinting(isPrintMode);
    }
});
