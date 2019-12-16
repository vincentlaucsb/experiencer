import * as React from "react";
import Popover from 'react-tiny-popover';
import { Button } from "./Buttons";

interface FileLoaderProps {
    loadData: (data: object) => void;
}

interface FileLoaderState {
    isOpen: boolean;
    filename: string;
}

// Form used for reading saved resume data files
export default class FileLoader extends React.Component<FileLoaderProps, FileLoaderState> {
    fileInput: any;

    constructor(props: FileLoaderProps) {
        super(props);

        this.state = {
            filename: '',
            isOpen: false
        };

        this.readFile = this.readFile.bind(this);
        this.onFileSelect = this.onFileSelect.bind(this);

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
    
    /**
     * Load file as soon as a user selects it
     * @param event
     */
    onFileSelect(event) {
        let userFile = this.fileInput.current.files[0];
        if (userFile) {
            this.readFile(userFile);
        }

        // Close popover
        this.setState({ isOpen: false });
    }

    render() {
        const expanded = (
            <form id="file-loader">
                <input type="file" onChange={this.onFileSelect} ref={this.fileInput} id="customFile" />
            </form>
        );

        return (
            <Popover
                isOpen={this.state.isOpen}
                position="bottom"
                content={expanded}>
                <Button
                    onClick={() => this.setState({ isOpen: !this.state.isOpen })}>
                    Load
                </Button>
            </Popover>
        );
    }
}