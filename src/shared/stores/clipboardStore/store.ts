import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ResumeNode } from '@/types';

interface ClipboardState {
    clipboard?: ResumeNode;

    setClipboard: (node: ResumeNode | undefined) => void;
    clearClipboard: () => void;
}

export const useClipboardStore = create<ClipboardState>()(
    devtools(
        (set) => ({
            clipboard: undefined,

            setClipboard: (node) => set({ clipboard: node }, false, 'setClipboard'),
            clearClipboard: () => set({ clipboard: undefined }, false, 'clearClipboard')
        }),
        { name: 'ClipboardStore' }
    )
);

export const useClipboard = () => useClipboardStore((state) => state.clipboard);
