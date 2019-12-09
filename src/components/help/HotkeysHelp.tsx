import React from "react";
import { Container, Table } from "react-bootstrap";
import { getApplicationKeyMap, ApplicationKeyMap } from 'react-hotkeys';
import HelpPage, { HelpPageActions } from "./HelpPage";

export default function HotkeysHelp(props: HelpPageActions) {
    const keyMap: ApplicationKeyMap = getApplicationKeyMap();
    let keyMapValues = new Array<object>();
    for (let k in keyMap) {
        keyMapValues.push(keyMap[k]);
    }

    let tableContent = keyMapValues.map((value) =>
        <tr>
            <td>{value['name']}</td>
            <td>
                {
                    (value['sequences'] as Array<object>).map(
                        (shortcut: object) => <span>{shortcut['sequence']}</span>
                    )
                }
            </td>
            <td>{value['description']}</td>
        </tr>);

    return <HelpPage title="Keyboard Shortcuts" {...props}>
        <Table striped bordered>
            <thead>
                <tr>
                    <th>Command</th>
                    <th>Shortcut</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {tableContent}
            </tbody>
        </Table>
    </HelpPage>
}