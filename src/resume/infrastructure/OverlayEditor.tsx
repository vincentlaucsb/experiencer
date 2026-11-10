import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface OverlayEditorProps {
    /** The trigger element to position relative to */
    triggerElement: HTMLElement | null;
    
    /** Whether the overlay is visible */
    isOpen: boolean;
    
    /** Content to display in the overlay */
    children: React.ReactNode;
    
    /** CSS class for the overlay container */
    className?: string;
}

/** Gap kept between the painted editor and either side of the viewport. */
export const OVERLAY_VIEWPORT_MARGIN_PX = 8;

interface OverlayFit {
    /** Horizontal nudge that keeps the painted editor inside the viewport. */
    offsetX: number;
    /** Widest the overlay box may grow while its painted content still fits. */
    maxWidth: number;
}

const UNCONSTRAINED_FIT: OverlayFit = { offsetX: 0, maxWidth: Number.POSITIVE_INFINITY };

/**
 * Clamp an overlay's painted bounds to the viewport.
 *
 * `paintedLeft`/`paintedRight` include descendants that bleed outside the overlay
 * box (the shared editor shell uses a negative margin to line up with the text).
 * The nudge is computed from the un-nudged position so repeated measurement settles.
 */
export function fitOverlayToViewport(
    painted: { left: number; right: number },
    overlayWidth: number,
    viewportWidth: number,
    previousOffsetX: number,
    margin = OVERLAY_VIEWPORT_MARGIN_PX
): OverlayFit {
    const paintedWidth = painted.right - painted.left;
    const available = Math.max(0, viewportWidth - margin * 2);
    const bleed = Math.max(0, paintedWidth - overlayWidth);
    const maxWidth = Math.max(0, available - bleed);

    const baseLeft = painted.left - previousOffsetX;
    const fittedWidth = Math.min(paintedWidth, available);
    let offsetX = 0;
    if (baseLeft + fittedWidth > viewportWidth - margin) {
        offsetX = viewportWidth - margin - fittedWidth - baseLeft;
    }
    if (baseLeft + offsetX < margin) {
        offsetX = margin - baseLeft;
    }

    return { offsetX: Math.round(offsetX), maxWidth: Math.floor(maxWidth) };
}

/**
 * Simple overlay editor that positions absolutely over a trigger element
 * Uses a portal to render outside the normal DOM hierarchy
 * 
 * Unlike Popover libraries (which position adjacent), this truly overlays
 * the content, maintaining layout stability. The overlay starts at the
 * trigger's width, but never paints past the viewport: on a phone the
 * trigger can be a letter-width node inside a horizontally scrolled canvas.
 */
export default function OverlayEditor({ 
    triggerElement, 
    isOpen, 
    children, 
    className = ''
}: OverlayEditorProps) {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const [fit, setFit] = useState<OverlayFit>(UNCONSTRAINED_FIT);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !triggerElement) return;

        const updatePosition = () => {
            const rect = triggerElement.getBoundingClientRect();
            setPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        };

        // Initial position
        updatePosition();

        // Update on scroll/resize
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, triggerElement]);

    useLayoutEffect(() => {
        const overlay = overlayRef.current;
        if (!isOpen || !overlay) return;

        const measure = () => {
            const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
            if (!viewportWidth) return;

            const box = overlay.getBoundingClientRect();
            let left = box.left;
            let right = box.right;
            for (const child of Array.from(overlay.children)) {
                const rect = child.getBoundingClientRect();
                left = Math.min(left, rect.left);
                right = Math.max(right, rect.right);
            }

            setFit(previous => {
                const next = fitOverlayToViewport({ left, right }, box.width, viewportWidth, previous.offsetX);
                return next.offsetX === previous.offsetX && next.maxWidth === previous.maxWidth
                    ? previous
                    : next;
            });
        };

        measure();

        // Lazy editors (the rich Markdown editor) change size after the first paint.
        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(measure);
        observer.observe(overlay);
        for (const child of Array.from(overlay.children)) observer.observe(child);
        return () => observer.disconnect();
    }, [isOpen, position]);

    useEffect(() => {
        if (!isOpen) setFit(UNCONSTRAINED_FIT);
    }, [isOpen]);

    if (!isOpen) return null;

    const overlayClassName = ['overlay-editor', className].filter(Boolean).join(' ');
    const hasMaxWidth = Number.isFinite(fit.maxWidth);

    return createPortal(
        <div
            ref={overlayRef}
            className={overlayClassName}
            style={{
                position: 'absolute',
                top: `${position.top}px`,
                left: `${position.left + fit.offsetX}px`,
                minWidth: `${hasMaxWidth ? Math.min(position.width, fit.maxWidth) : position.width}px`,
                maxWidth: hasMaxWidth ? `${fit.maxWidth}px` : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
            // The portal's React parent is the edited node's parent container,
            // whose right-button mousedown would reselect it and close this
            // editor before the browser menu, with its spelling suggestions, opens.
            onMouseDown={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
        >
            {children}
        </div>,
        document.body
    );
}
