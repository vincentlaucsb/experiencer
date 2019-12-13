import React from "react";
import { Box, Button } from "@material-ui/core";
import { Action, SelectedNodeProps } from "../ResumeNodeBase";
import { AddButton } from "./Buttons";

export default function TopEditingBar(props: any) {
    const selectedNode = props as SelectedNodeProps;
    if (selectedNode) {
        return <Box>
            <Button>Add</Button>
            <Button onClick={props.delete}>Delete</Button>
            <Button onClick={selectedNode.toggleEdit}>Edit</Button>
            <Button onClick={props.moveUp}>Move Up</Button>
            <Button onClick={props.moveDown}>Move Down</Button>
        </Box>
    }

    return <Box>
        <Button>Add</Button>
        <Button>Delete</Button>
        <Button>Edit</Button>
    </Box>
}