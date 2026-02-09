import { useEffect } from 'react';

/**
 * Hook to make input elements auto-expand to fit their content width
 * 
 * @param refs - Variable number of input element refs to auto-expand
 * 
 * @example
 * const titleRef = useRef<HTMLInputElement>(null);
 * const subtitleRef = useRef<HTMLInputElement>(null);
 * useAutoExpandInput(titleRef, subtitleRef);
 */
export default function useAutoExpandInput(...refs: React.RefObject<HTMLInputElement | null>[]) {
    useEffect(() => {
        const handleInput = (input: HTMLInputElement) => {
            input.style.width = '0px';
            input.style.width = input.scrollWidth + 'px';
        };

        // Set up listeners for all refs
        const listeners = refs.map((ref) => {
            const input = ref.current;
            if (!input) return null;

            const listener = () => handleInput(input);
            
            // Initial expand
            handleInput(input);
            
            input.addEventListener('input', listener);
            return { input, listener };
        }).filter(Boolean) as Array<{ input: HTMLInputElement; listener: () => void }>;

        return () => {
            listeners.forEach(({ input, listener }) => {
                input.removeEventListener('input', listener);
            });
        };
    }, [refs]);
}
