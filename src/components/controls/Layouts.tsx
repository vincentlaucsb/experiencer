import React from "react";
import SplitPane from "react-split-pane";

interface DefaultLayoutProps {
    topNav: JSX.Element;
    main: JSX.Element;
}

interface SidebarLayoutProps extends DefaultLayoutProps {
    isPrinting?: boolean;
    sideBar: JSX.Element;
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
            <div>
                {props.sideBar}
            </div>
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
            pane1Style={{ height: "100%", overflowY: "auto" }}
            pane2Style={{ overflow: "auto" }}
        >
            {props.main}
            {props.sideBar}
        </SplitPane>
    </SplitPane>
}