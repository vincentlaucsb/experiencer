import * as React from "react";
import { Button } from './Buttons';
import Popover from 'react-tiny-popover';

import Octicon, { DesktopDownload} from "@primer/octicons-react";

interface FileSaverProps {
    saveFile: (filename: string) => void;
}

/** Form used for saving resume data */
export default function FileSaver(props: FileSaverProps) {
    let [filename, setFilename] = React.useState('resume.json');
    let [open, setOpen] = React.useState(false);

    const onChange = (event: any) => { setFilename(event.target.value); }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.saveFile(filename);

        // Make popover close when "Save" is clicked
        setOpen(false);
    }

    const form = (
        <form id="file-saver" className="pure-form pure-form-stacked">
            <div>
                <label form="filename">Filename</label>
                <input onChange={onChange} value={filename} id="filename" />
            </div>
            <Button onClick={handleClick} primary>Download</Button>
        </form>
    );

    return (
        <Popover content={form} position="bottom" isOpen={open}>
            <Button onClick={() => setOpen(!open)}>
                <Octicon icon={DesktopDownload} />Save As
            </Button>
        </Popover>
    );
}