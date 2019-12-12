import React from "react";
import { Nav } from "react-bootstrap";
import HotkeysHelp from "./HotkeysHelp";
import HelpPage from "./HelpPage";
import { Action } from "../ResumeNodeBase";
import SavingHelp from "./SavingHelp";
import StartHelp from "./StartHelp";

interface HelpProps {
    close: Action;
}

interface HelpState {
    page: 'home' | 'hotkeys' | 'saving' | 'start';
}

export default class Help extends React.Component<HelpProps, HelpState> {
    constructor(props) {
        super(props);

        this.state = {
            page: 'home'
        };
    }

    /** Return props for the various help pages */
    get pageProps() {
        return {
            close: this.props.close,
            returnHome: () => this.setState({ page: 'home' })
        }
    }

    render() {
        switch (this.state.page) {
            case 'hotkeys':
                return <HotkeysHelp {...this.pageProps} />
            case 'saving':
                return <SavingHelp {...this.pageProps} />
            case 'start':
                return <StartHelp {...this.pageProps} />
            default:
                return <HelpPage close={this.props.close} title="Help">
                    <Nav className="flex-column">
                        <Nav.Link onClick={() => this.setState({ page: 'start' })}>Getting Started</Nav.Link>
                        <Nav.Link onClick={() => this.setState({ page: 'saving' })}>Saving and Printing</Nav.Link>
                        <Nav.Link onClick={() => this.setState({ page: 'hotkeys' })}>Keyboard Shortcuts</Nav.Link>
                    </Nav>
                </HelpPage>
        }
    }
}