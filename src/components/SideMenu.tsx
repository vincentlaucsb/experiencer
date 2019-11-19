import * as React from "react";
import { Button, Collapse } from "react-bootstrap";
import { useState } from "react";

export function SideMenu(props: any) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(!open)}
                aria-controls="side-bar"
                aria-expanded={open}
            >
                {open ? "Collapse" : "Expand"}
            </Button>
            <Collapse in={open}>
                <div>
                    {props.children}
                </div>
            </Collapse>
        </>
    );
}