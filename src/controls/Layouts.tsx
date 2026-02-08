import React from "react";
import { SplitPane } from "./SplitPane";

interface DefaultLayoutProps {
    topNav: JSX.Element;
    main: JSX.Element;
}

interface SidebarLayoutProps extends DefaultLayoutProps {
    isPrinting?: boolean;
    sidebar: JSX.Element;
}

export function DefaultLayout(props: DefaultLayoutProps) {
    return <React.Fragment>
        {props.topNav}
        {props.main}
    </React.Fragment>
}

export function StaticSidebarLayout(props: SidebarLayoutProps) {
    if (props.isPrinting) {
        return <>{ props.main }</>
    }

    return <React.Fragment>
        {props.topNav}
        <div id="main-grid">
            {props.main}
            {props.sidebar}
        </div>
    </React.Fragment>
}

export const ResizableSidebarLayout = React.forwardRef(
    (props: SidebarLayoutProps, ref: React.Ref<HTMLDivElement>) => (
        <div 
            ref={ref}
            style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100vh',
                overflow: 'hidden'
            }}
        >
            {/* Top navigation bar */}
            <div style={{ flexShrink: 0 }}>
                {props.topNav}
            </div>
            
            {/* Resizable split pane area */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <SplitPane 
                    left={props.main} 
                    right={props.sidebar}
                    minSize={300}
                    storageKey="experiencer-sidebar-width"
                />
            </div>
        </div>
    ));