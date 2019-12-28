import * as React from "react";
import { Button } from './Buttons';
import ButtonGroup from "./ButtonGroup";

interface FileSaverProps {
    close: () => void;
    saveFile: (filename: string) => void;
}

/** Form used for saving resume data */
export default function FileSaver(props: FileSaverProps) {
    let [filename, setFilename] = React.useState('resume.json');

    const onChange = (event: any) => { setFilename(event.target.value); }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.saveFile(filename);
    }

    return (
        <form id="file-saver" className="pure-form pure-form-stacked">
            <div>
                <label form="filename">Filename</label>
                <input onChange={onChange} value={filename} id="filename" />
            </div>

            <Button onClick={handleClick} primary>Download</Button>
            <Button onClick={() => props.close()}>Cancel</Button>
        </form>
    );
}