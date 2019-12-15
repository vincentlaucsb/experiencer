import * as React from "react";
import { Button, TextField } from "@material-ui/core";

interface FileSaverProps {
    saveFile: (filename: string) => void;
}

// Form used for saving resume data
export default function FileSaver(props: FileSaverProps) {
    const [filename, setFilename] = React.useState('resume.json');
    const [isOpen, setOpen] = React.useState(false);
    const onChange = (event: any) => {
        const filename = event.target.value;
        setFilename(filename);
    }

    const expanded = isOpen ? 
        <form>
            <TextField
                onChange={onChange}
                value={filename}
                id="filename"
                label="Filename"
                variant="outlined" />
            <Button
                color="inherit"
                onClick={() => props.saveFile(filename)}>Save</Button>
        </form> : <></>

    return <>
        <Button
            color="inherit"
            onClick={() => setOpen(!isOpen)}>
            Save to File
        </Button>
        {expanded}
    </>
}