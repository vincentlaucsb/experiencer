import { Button, Collapse } from "react-bootstrap";
import { useState } from "react";
import React = require("react");

export function SideMenu() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(!open)}
                aria-controls="side-bar"
                aria-expanded={open}
            >
                Click
            </Button>
            <Collapse in={open}>
                <div>
                    Test test test testse testse
                </div>
            </Collapse>
        </>
    );
}