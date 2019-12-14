import React from "react";
import { Box, Button, Menu, MenuItem } from "@material-ui/core";
import { Action, SelectedNodeProps, ModifyChild, AddChild } from "../ResumeNodeBase";
import { IdType } from "../utility/HoverTracker";

type AddOptions = Array<{ text: string; node: object }>;

const addOptions: AddOptions = [
    {
        text: 'Section',
        node: {
            type: 'Section'
        }
    },

    {
        text: 'Entry',
        node: {
            type: 'Entry'
        }
    }
];

interface AddMenuProps {
    options: AddOptions;
    addChild: AddChild;
    id: IdType;
}

export function AddMenu(props: AddMenuProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return <>
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
            Add Items
        </Button>
        <Menu
            id="add-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            {props.options.map((opt) =>
                <MenuItem onClick={() => props.addChild(props.id, opt.node)}>{opt.text}</MenuItem>
            )}
        </Menu>
    </>
}

export default function TopEditingBar(props: SelectedNodeProps) {
    const id = props.id;
    

    return <Box>
        <AddMenu addChild={props.addChild as AddChild} id={id} options={addOptions} />
        <Button onClick={() => props.deleteChild(id)}>Delete</Button>
        <Button onClick={() => (props.toggleEdit as ModifyChild)(id)}>Edit</Button>
        <Button onClick={props.moveUp}>Move Up</Button>
        <Button onClick={props.moveDown}>Move Down</Button>
    </Box>
}