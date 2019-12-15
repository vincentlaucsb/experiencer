import * as React from "react";
import { Button, TextField, Popover, makeStyles, createStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(2),

            '& button': {
                marginTop: theme.spacing(2)
            }
        }
    }),
);

interface FileSaverProps {
    saveFile: (filename: string) => void;
}

// Form used for saving resume data
export default function FileSaver(props: FileSaverProps) {
    const classes = useStyles();
    const id = 'file-saver';
    const [filename, setFilename] = React.useState('resume.json');
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const onChange = (event: any) => { setFilename(event.target.value); }
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => { setAnchorEl(null); };
    const open = Boolean(anchorEl);

    // TODO: Make popover close when "Save" is clicked
    const form = <form className={classes.root}>
        <TextField onChange={onChange} value={filename}
            id="filename" label="Filename" />
        <Button variant="contained" color="primary"
            onClick={() => props.saveFile(filename)}>Save</Button>
    </form>

    return (
        <>
        <Button aria-describedby={id} color="inherit" onClick={handleClick}>
            Save to File
        </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {form}
            </Popover>
        </>
    );
}