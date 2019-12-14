import React from "react";
import { Box, Button } from "@material-ui/core";
import { Action, SelectedNodeProps } from "../ResumeNodeBase";
import { AddButton } from "./Buttons";
import { IdType } from "../utility/HoverTracker";

export default function TopEditingBar(props: any) {
    const selectedNode = props as SelectedNodeProps;
    if (selectedNode) {
        let edit: any = () => { };
        if (selectedNode.toggleEdit) {
            edit = (selectedNode.toggleEdit as (id: IdType) => void).bind(props.id);
        }

        return <Box>
            <Button>Add</Button>
            <Button onClick={props.delete}>Delete</Button>
            <Button onClick={edit}>Edit</Button>
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