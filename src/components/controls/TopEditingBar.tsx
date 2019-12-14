import React from "react";
import { Box, Button } from "@material-ui/core";
import { Action, SelectedNodeProps, ModifyChild } from "../ResumeNodeBase";

export default function TopEditingBar(props: SelectedNodeProps) {
    const id = props.getId();

    return <Box>
        <Button>Add</Button>
        <Button onClick={() => props.deleteChild(id)}>Delete</Button>
        <Button onClick={() => (props.toggleEdit as ModifyChild)(id)}>Edit</Button>
        <Button onClick={props.moveUp}>Move Up</Button>
        <Button onClick={props.moveDown}>Move Down</Button>
    </Box>
}