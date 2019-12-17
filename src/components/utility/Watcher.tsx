import React from "react";

export default function Watcher(WrappedComponent) {
    return class extends React.Component {

        render() {
            return <WrappedComponent {...this.props} />
        }
    }
}