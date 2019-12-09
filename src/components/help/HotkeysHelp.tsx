import React from "react";
import { Container, Table } from "react-bootstrap";

export default function HotkeysHelp() {
    return <Container>
        <h2>Hotkeys</h2>
        <p>
            <h3>General Hotkeys</h3>
            <Table striped bordered>
            <thead>
                <tr>
                    <th>Command</th>
                    <th>Shortcut</th>
                    <th>Description</th>
                </tr>
                </thead>
            </Table>

            <h3>Editing Hotkeys</h3>
        </p>
    </Container>
}