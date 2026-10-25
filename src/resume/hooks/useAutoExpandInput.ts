import { useLayoutEffect } from 'react';
import { bindAutoExpandInputs } from '@/shared/utils/autoExpandInputs';

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
    useLayoutEffect(() => bindAutoExpandInputs(refs.map(ref => ref.current)), [refs]);
}
