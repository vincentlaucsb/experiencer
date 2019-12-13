import React from "react";
import { Box, Button } from "@material-ui/core";
import { Action, SelectedNodeProps } from "../ResumeNodeBase";
import { AddButton } from "./Buttons";


export default function TopEditingBar(props: any) {
    const selectedNode = props as SelectedNodeProps;
    if (selectedNode) {
        return <Box>
            <Button>Add</Button>
            <Button onClick={selectedNode.deleteChild}>Delete</Button>
            <Button onClick={selectedNode.toggleEdit}>Edit</Button>
        </Box>
    }

    return <Box>
        <Button>Add</Button>
        <Button>Delete</Button>
        <Button>Edit</Button>
    </Box>
}