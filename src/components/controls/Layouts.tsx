import React from "react";
import SplitPane from "react-split-pane";

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

export function ResizableSidebarLayout(props: SidebarLayoutProps) {
    return <SplitPane split="horizontal"
        pane1Style={{ display: "block", height: "auto" }}
        resizerStyle={{ display: "none" }}>
        {props.topNav}
        <SplitPane split="vertical" defaultSize="500px" primary="second"
            style={{ height: "100%" }}
            pane1Style={{ height: "100%", overflow: "auto" }}
            pane2Style={{ overflow: "auto" }}>
            {props.main}
            {props.sidebar}
        </SplitPane>
    </SplitPane>
}