import * as React from "react";
import { Button, InputGroup, Collapse, Form } from "react-bootstrap";
import { InputGroupAppend } from "react-bootstrap/InputGroup";

interface FileLoaderProps {
    loadData: (data: Array<object>) => void;
}

interface FileLoaderState {
    isOpen: boolean;
    filename: string;
}

// Form used for reading Auto Cost Calculator saved files
export class FileLoader extends React.Component<FileLoaderProps, FileLoaderState> {
    fileInput: any;

    constructor(props: FileLoaderProps) {
        super(props);

        this.state = {
            filename: '',
            isOpen: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.readFile = this.readFile.bind(this);

        // See: https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag
        this.fileInput = React.createRef();
    }

    readFile(file: any) {
        /*
         * Ref:
         * https://stackoverflow.com/questions/750032/reading-file-contents-on-the-client-side-in-javascript-in-various-browsers
         */

        const reader = new FileReader();
        reader.onload =(fileLoadedEvent: Event) => {
            var text = reader.result;
            if (text as string) {
                this.props.loadData(JSON.parse((text as string).toString()));
            }
        };

        reader.readAsText(file, "UTF-8");
    }

    handleSubmit(event) {
        event.preventDefault(); // Prevent page refresh

        let userFile = this.fileInput.current.files[0];
        if (userFile) {
            this.readFile(userFile);
        }
    }

    renderExpanded() {
        if (this.state.isOpen) {
            return <React.Fragment>
                <Form onSubmit={this.handleSubmit} id="load-file">
                    <input className="form-control" type="file" ref={this.fileInput} />
                </Form>
                <InputGroup.Append>
                    <Button form="load-file" type="submit">Open</Button>
                </InputGroup.Append>
            </React.Fragment>
        }

        return <></>
    }

    renderTrigger() {
        const button = <Button onClick={() => this.setState({ isOpen: !this.state.isOpen })}>Load</Button>

        if (this.state.isOpen) {
            return <InputGroup.Prepend>
                {button}
            </InputGroup.Prepend>
        }

        return button;
    }

    render() {
        return <InputGroup>
            {this.renderTrigger()}
            {this.renderExpanded()}
        </InputGroup>
    }
}