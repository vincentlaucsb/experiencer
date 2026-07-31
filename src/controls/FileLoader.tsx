import * as React from "react";
import { Action } from "@/types";

interface FileLoaderProps {
    close: Action;
    loadData: (data: object, title?: string) => void;
}

interface FileLoaderState {
    filename: string;
}

/** Reads a saved resume file and hands its parsed data to the library workflow. */
export default class FileLoader extends React.Component<FileLoaderProps, FileLoaderState> {
    fileInput: any;

    constructor(props: FileLoaderProps) {
        super(props);

        this.state = {
            filename: '',
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
                const title = this.state.filename || file?.name;
                this.props.loadData(JSON.parse((text as string).toString()), title);
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
            this.setState({ filename: userFile.name });
            this.readFile(userFile);
        }

        // Close modal
        this.props.close();
    }

    render() {
        return (
            <form id="file-loader">
                <input type="file" onChange={this.onFileSelect} ref={this.fileInput} id="customFile" />
            </form>
        );
    }
}
