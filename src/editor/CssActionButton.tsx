import { Button } from '@/controls/Buttons';
import { useEffect, useState, type ComponentProps } from 'react';
import { Popover } from 'react-tiny-popover';

/** Shows help above the split panes while keeping focus on the action itself. */
export default function CssActionButton({ label, children, onClick, ...props }: ComponentProps<typeof Button> & { label: string }) {
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const showTooltip = (hovered || focused) && !dismissed;

    useEffect(() => {
        if (!showTooltip) return;
        const dismiss = () => setDismissed(true);
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') dismiss();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [showTooltip]);

    return <span className="css-action-help"
        onMouseEnter={() => {
            setHovered(true);
            setDismissed(false);
        }}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => {
            setFocused(true);
            setDismissed(false);
        }}
        onBlur={() => setFocused(false)}
    >
        <Button {...props} aria-label={label} onClick={event => {
            setDismissed(true);
            onClick?.(event);
        }}>{children}</Button>
        {showTooltip && <Popover
            isOpen
            positions={['bottom', 'top']}
            align="end"
            boundaryElement={document.documentElement}
            containerClassName="css-action-tooltip-layer"
            content={<span className="css-action-tooltip" role="tooltip">{label}</span>}
        >
            {/* Mount the positioning work only for visible help without remounting the button. */}
            <span className="css-action-tooltip-anchor" aria-hidden="true" />
        </Popover>}
    </span>;
}
