import React from "react";
import { Box, Button } from "@material-ui/core";
import { Action, SelectedNodeProps } from "../ResumeNodeBase";
import { AddButton } from "./Buttons";
import { IdType } from "../utility/HoverTracker";

export default function TopEditingBar(props: any) {
    const selectedNode = props as SelectedNodeProps;
    if (selectedNode) {
        let getData: any;

        let id = new Array<number>();
        if (selectedNode.getId) {
            id = selectedNode.getId();
            console.log("GOT ID", id);
        }

        let edit: any = () => { };
        if (selectedNode.toggleEdit) {
            edit = (selectedNode.toggleEdit as (id: IdType) => void).bind(props.id);
        }

        return <Box>
            <Button>Add</Button>
            <Button onClick={() => props.delete(id)}>Delete</Button>
            <Button onClick={edit}>Edit</Button>
            <Button onClick={() => props.moveUp(id)}>Move Up</Button>
            <Button onClick={() => props.moveDown(id)}>Move Down</Button>
        </Box>
    }

    return <Box>
        <Button>Add</Button>
        <Button>Delete</Button>
        <Button>Edit</Button>
    </Box>
}