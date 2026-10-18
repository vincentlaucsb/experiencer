import { Button } from '@/controls/Buttons';
import type { ComponentProps } from 'react';

/** Keeps compact inspector controls named and explains them on pointer hover or keyboard focus. */
export default function CssActionButton({ label, children, ...props }: ComponentProps<typeof Button> & { label: string }) {
    return <span className="css-action-help">
        <Button {...props} aria-label={label} title={label}>{children}</Button>
        <span className="css-action-tooltip" role="tooltip">{label}</span>
    </span>;
}
