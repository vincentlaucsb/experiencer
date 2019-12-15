import { Action } from "../ResumeNodeBase";
import React from "react";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import GitHub from '../../icons/mark-github.svg';
import { EditorMode } from "../ResumeComponent";
import { isUndefined } from "util";
import { withTooltip } from "./Buttons";
import { AppBar, makeStyles, Theme, createStyles, Toolbar, IconButton, Typography, Button } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';

interface TopNavBarProps {
    mode: EditorMode;

    /** Loading and Saving */
    loadData: (data: object) => void;
    saveFile: (filename: string) => void;

    /** Clipboard Actions */
    copyClipboard?: Action;
    pasteClipboard?: Action;
    unselect?: Action;

    /** Sidebar Actions */
    changeTemplate: Action;
    toggleLanding: Action;
    toggleHelp: Action;
    toggleStyleEditor: Action;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
    }),
);

/** Conditionally render buttons
 * @param onClick Click action if button is enabled
 */
function getButtonProps(onClick?: any) {
    const enabled = !isUndefined(onClick);

    let props = {
        disabled: !enabled,
        // variant: "outline-light" as ButtonProps["variant"]
    };

    if (enabled) {
        props['onClick'] = onClick;
    }

    return props;
}

/** The top nav bar for the resume editor */
export default function TopNavBar(props: TopNavBarProps) {
    const isEditingStyle = props.mode === 'editingStyle';
    const isPrinting = props.mode === 'printing';

    const classes = useStyles();

    /** Return some controls for editing the resume */
    function renderEditorControls() {
        if (['changingTemplate', 'landing'].indexOf(props.mode) >= 0) {
            return <></>
        }

        const copyProps = getButtonProps(props.copyClipboard);
        const pasteProps = getButtonProps(props.pasteClipboard);
        const unselectProps = getButtonProps(props.unselect);

        // Highlight "Edit Style" button conditionally
        const editStyleProps = {
            onClick: props.toggleStyleEditor,
            // variant: isEditingStyle ? "light" : "outline-light" as ButtonProps["variant"]
        };

        const CopyButton = withTooltip(Button, 'Shift + C', 'copy-button');
        const PasteButton = withTooltip(Button, 'Shift + V', 'paste-button');
        const UnselectButton = withTooltip(Button, 'Esc', 'unselect-button');


        return <></>
        /**
        return <>

            <ButtonGroup className="mr-2">
                <CopyButton {...copyProps}>Copy</CopyButton>
                <PasteButton {...pasteProps}>Paste</PasteButton>
                <UnselectButton {...unselectProps}>Unselect</UnselectButton>
            </ButtonGroup>
            <ButtonGroup className="mr-2">
                <Button {...editStyleProps}>Edit Style</Button>
            </ButtonGroup>
        </>
        **/
    }

    const helpOk = ['normal', 'help', 'editingStyle'].indexOf(props.mode) >= 0; 
    const helpButton = helpOk ? <Button onClick={props.toggleHelp}>
        Help</Button> : <></>

    /**
                <FileSaver saveFile={this.props.saveFile} />
                {helpButton}
            </Nav>

            {this.renderEditorControls()}

            <Nav>
                <Nav.Link href="https://github.com/vincentlaucsb/experiencer"><img src={GitHub} style={{ filter: "invert(1)", height: "30px" }} alt="GitHub" /></Nav.Link>
            </Nav>
            */
    if (!isPrinting) {

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            Experiencer
                        </Typography>
                        <Button color="inherit" onClick={props.changeTemplate}>New</Button>
                        <FileLoader loadData={props.loadData} />
                        <FileSaver saveFile={props.saveFile} />
                        {helpButton}
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }

    return <></>
}