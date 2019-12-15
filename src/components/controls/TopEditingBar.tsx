import React from "react";
import { Box, Button, Menu, MenuItem } from "@material-ui/core";
import { Action, SelectedNodeProps, ModifyChild, AddChild } from "../ResumeNodeBase";
import { IdType } from "../utility/HoverTracker";

interface NodeOption {
    text: string;
    node: object;
}

type AddOptions = Array<NodeOption>;

const addOptions: Map<string, NodeOption> = new Map<string, NodeOption>([
    ['Column', {
        text: 'Flexible Column',
        node: {
            type: 'FlexibleColumn'
        }
    }],

    [ 'Section', {
        text: 'Section',
        node: {
            type: 'Section'
        }
    }],

    [ 'Entry', {
        text: 'Entry',
        node: {
            type: 'Entry'
        }
    }],

    [ 'Paragraph', {
        text: 'Paragraph',
        node: { type: 'Paragraph' }
    }],

    ['Bulleted List', {
        text: 'Bulleted List',
        node: {
            type: 'Paragraph',
            value: '<ul><li></li></ul>'
        }
    }],

    ['Description List', {
        text: 'Description List',
        node: {
            type: 'DescriptionList',
            children: [{
                type: 'DescriptionListItem'
            }]
        }
    }]
]);

function addMap(type: string) {
    switch (type) {
        case 'FlexibleRow':
            return 'Column';
        case 'Entry':
            return ['Bulleted List', 'Description List', 'Paragraph'];
        case 'Section':
            return ['Entry', 'Paragraph', 'Bulleted List', 'Description List'];
        default:
            return ['Section', 'Entry', 'Paragraph', 'Bulleted List', 'Description List'];
    }
}

interface AddOptionProps {
    options: string | Array<string>;
    addChild: AddChild;
    id: IdType;
}

/**
 * Return the button or menu for adding children to a node
 * @param options
 */
export function AddOption(props: AddOptionProps) {
    const options = props.options;

    if (Array.isArray(options)) {
        let optionsDetail: AddOptions = [];

        options.forEach((nodeType: string) => {
            optionsDetail.push(addOptions.get(nodeType) as NodeOption)
        });

        return <AddMenu options={optionsDetail} addChild={props.addChild} id={props.id} />
    }

    const node: NodeOption = addOptions.get(options as string) as NodeOption;
    return <Button onClick={() => props.addChild(props.id, node.node)}>
        Add {options}
    </Button>
}

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
                <MenuItem key={opt.text} onClick={() => props.addChild(props.id, opt.node)}>{opt.text}</MenuItem>
            )}
        </Menu>
    </>
}

export default function TopEditingBar(props: SelectedNodeProps) {
    const id = props.id;

    return <Box>
        <AddOption id={id} addChild={props.addChild as AddChild} options={addMap(props.type)} />
        <Button onClick={() => props.deleteChild(id)}>Delete</Button>
        <Button onClick={() => (props.toggleEdit as ModifyChild)(id)}>Edit</Button>
        <Button onClick={props.moveUp}>Move Up</Button>
        <Button onClick={props.moveDown}>Move Down</Button>
    </Box>
}