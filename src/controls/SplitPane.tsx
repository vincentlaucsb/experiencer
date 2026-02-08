import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/shared/stores/editorStore';

interface SplitPaneProps {
    left: React.ReactNode;
    right: React.ReactNode;
    defaultSize?: number;  // Width of left pane in pixels
    minSize?: number;      // Minimum left pane width
    maxSize?: number;      // Maximum left pane width
    storageKey?: string;   // localStorage key for persisting width
}

/**
 * Simple resizable split pane component
 * 
 * Features:
 * - Drag the divider to resize panes
 * - Double-click divider to reset to default size
 * - Persists width to localStorage (if storageKey provided)
 * - Clamps width between min and max bounds
 * - Exposes left pane ref for scroll/resize listeners
 */
export const SplitPane = React.forwardRef<HTMLDivElement, SplitPaneProps>(function SplitPane({ 
    left, 
    right, 
    defaultSize = Math.floor(window.innerWidth * 0.67), // 67% of viewport width
    minSize = 200, 
    maxSize,
    storageKey = 'splitpane-width'
}: SplitPaneProps, ref) {
    // Load initial width from localStorage or use default
    const getInitialWidth = () => {
        if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = parseInt(saved, 10);
                if (!isNaN(parsed)) {
                    return Math.max(minSize, parsed);
                }
            }
        }
        return defaultSize;
    };

    const [leftWidth, setLeftWidth] = useState(getInitialWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const leftPaneRef = useRef<HTMLDivElement | null>(null);

    // Update store when left pane mounts/unmounts
    useEffect(() => {
        useEditorStore.getState().setLeftPaneElement(leftPaneRef.current);
        
        return () => {
            useEditorStore.getState().setLeftPaneElement(null);
        };
    }, []);
    // Calculate max size based on container width
    const getMaxSize = () => {
        if (maxSize !== undefined) return maxSize;
        if (!containerRef.current) return window.innerWidth - 200;
        return containerRef.current.offsetWidth - 200;
    };

    // Persist width to localStorage whenever it changes
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(storageKey, leftWidth.toString());
        }
    }, [leftWidth, storageKey]);

    // Handle mouse drag
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            
            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = e.clientX - containerRect.left;
            
            // Clamp between min and max
            const clampedWidth = Math.max(minSize, Math.min(getMaxSize(), newWidth));
            setLeftWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, minSize]);

    const handleDoubleClick = () => {
        setLeftWidth(defaultSize);
    };

    return (
        <div 
            ref={containerRef}
            style={{ 
                display: 'flex', 
                height: '100%', 
                overflow: 'hidden',
                userSelect: isDragging ? 'none' : 'auto' 
            }}
        >
            {/* Left pane */}
            <div 
                ref={(el) => {
                    // Combine refs
                    leftPaneRef.current = el;
                    if (typeof ref === 'function') {
                        ref(el);
                    } else if (ref) {
                        ref.current = el;
                    }
                }}
                style={{ width: leftWidth, overflow: 'auto', height: '100%' }}
            >
                {left}
            </div>
            
            {/* Resizer */}
            <div
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDoubleClick={handleDoubleClick}
                style={{
                    width: 10,
                    cursor: 'col-resize',
                    background: 'transparent',
                    flexShrink: 0,
                    position: 'relative'
                }}
                title="Drag to resize, double-click to reset"
            />
            
            {/* Right pane */}
            <div style={{ flex: 1, overflow: 'auto', height: '100%' }}>
                {right}
            </div>
        </div>
    );
});
