import * as React from "react";
import { Form, Nav, InputGroup, Button } from "react-bootstrap";

interface FileSaverProps {
    saveFile: (filename: string) => void;
}

interface FileLoaderState {
    isOpen: boolean;
    filename: string;
}

// Form used for reading Auto Cost Calculator saved files
export default class FileSaver extends React.Component<FileSaverProps, FileLoaderState> {
    constructor(props) {
        super(props);

        this.state = {
            filename: 'resume.json',
            isOpen: false
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(event: any) {
        const filename = event.target.value;
        this.setState({ filename: filename });
    }

    renderExpanded() {
        if (this.state.isOpen) {
            return <Form inline>
                <InputGroup>
                    <Form.Control
                        onChange={this.onChange}
                        value={this.state.filename}
                    />
                    <InputGroup.Append>
                        <Button onClick={() => this.props.saveFile(this.state.filename)} variant="outline-light">Save</Button>
                    </InputGroup.Append>
                </InputGroup>
            </Form>
        }

        return <></>
    }

    renderTrigger() {
        return <Nav.Link
            onClick={() => this.setState({ isOpen: !this.state.isOpen })}>
            Save to File
        </Nav.Link>
    }

    render() {
        return <>
            {this.renderTrigger()}
            {this.renderExpanded()}
        </>
    }
}