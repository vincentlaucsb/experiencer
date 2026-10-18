import { useEffect, useRef } from 'react';
import { InlineEditingSession, type InlineEditingOptions } from '@/shared/services/InlineEditingSession';

export type useEditingControlsOptions<T extends string | Record<string, string> = string> = InlineEditingOptions<T>;

/** Bridges component values and the document keyboard lifecycle into one edit session. */
export default function useEditingControls<T extends string | Record<string, string> = string>(options: InlineEditingOptions<T>) {
    const session = useRef(new InlineEditingSession(options)).current;
    useEffect(() => session.sync(options), [session, options]);
    useEffect(() => session.attach(document), [session]);
    return { cancel: session.cancel, save: session.save };
}
