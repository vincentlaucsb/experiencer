import * as React from "react";
import { Action } from "@/types";
import { Button } from "./Buttons";

interface FileLoaderProps {
    close: Action;
    loadData: (data: object, title?: string) => void;
}

interface FileLoaderState {
    filename: string;
}

/** Reads a saved resume file and hands its parsed data to the library workflow. */
export default class FileLoader extends React.Component<FileLoaderProps, FileLoaderState> {
    fileInput = React.createRef<HTMLInputElement>();

    constructor(props: FileLoaderProps) {
        super(props);

        this.state = {
            filename: '',
        };

        this.readFile = this.readFile.bind(this);
        this.onFileSelect = this.onFileSelect.bind(this);

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
    onFileSelect() {
        const userFile = this.fileInput.current?.files?.[0];
        if (userFile) {
            this.setState({ filename: userFile.name });
            this.readFile(userFile);
        }

        // Close modal
        this.props.close();
    }

    render() {
        const selectedFileLabel = this.state.filename || "No file selected";

        return (
            <form id="file-loader" className="file-loader-form">
                <div className="file-loader-copy">
                    <span className="file-loader-label">Resume file</span>
                    <p id="file-loader-description">
                        Choose an Experiencer resume JSON file to open.
                    </p>
                </div>
                <input
                    aria-hidden="true"
                    accept=".json,application/json"
                    className="file-loader-native-input"
                    id="customFile"
                    onChange={this.onFileSelect}
                    ref={this.fileInput}
                    tabIndex={-1}
                    type="file"
                />
                <div className="file-loader-picker">
                    <Button
                        aria-describedby="file-loader-description"
                        onClick={() => this.fileInput.current?.click()}
                        type="button"
                        variant="primary"
                    >
                        Choose file
                    </Button>
                    <span aria-live="polite" className="file-loader-selection">
                        {selectedFileLabel}
                    </span>
                </div>
            </form>
        );
    }
}
