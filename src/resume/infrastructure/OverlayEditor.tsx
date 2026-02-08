import React, { useEffect, useRef, useState } from 'react';
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

/**
 * Simple overlay editor that positions absolutely over a trigger element
 * Uses a portal to render outside the normal DOM hierarchy
 * 
 * Unlike Popover libraries (which position adjacent), this truly overlays
 * the content, maintaining layout stability.
 */
export default function OverlayEditor({ 
    triggerElement, 
    isOpen, 
    children, 
    className = 'overlay-editor' 
}: OverlayEditorProps) {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
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

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={overlayRef}
            className={className}
            style={{
                position: 'absolute',
                top: `${position.top}px`,
                left: `${position.left}px`,
                minWidth: `${position.width}px`,
                zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>,
        document.body
    );
}
