import React from "react";
import { Nav } from "react-bootstrap";
import HotkeysHelp from "./HotkeysHelp";

interface HelpState {
    page: 'home' | 'hotkeys';
}

export default class Help extends React.Component<{}, HelpState> {
    constructor(props) {
        super(props);

        this.state = {
            page: 'home'
        };
    }

    render() {
        switch (this.state.page) {
            case 'hotkeys':
                return <HotkeysHelp />
            default:
                return <Nav className="flex-column">
                    <Nav.Link>Getting Started</Nav.Link>
                    <Nav.Link>Saving and Printing</Nav.Link>
                    <Nav.Link onClick={() => this.setState({ page: 'hotkeys' })}>Hotkeys</Nav.Link>
                </Nav>
        }
    }
}