import React from "react";
import PureMenu from "../controls/menus/PureMenu";
import IconicMenuItem from "../controls/menus/MenuItem";
import FileLoader from "../controls/FileLoader";
import Modal from "../controls/Modal";
import { Globals } from "../utility/Types";

interface LandingProps {
    className?: string;
    loadLocal: () => void;
    loadData: (data: object) => void;
    new: () => void;
}

export default function Landing(props: LandingProps) {
    let [isOpen, setOpen] = React.useState(false);
    let modalContent = <FileLoader close={() => setOpen(false)} loadData={props.loadData} />

    const returnButton = (localStorage.getItem(Globals.localStorageKey)) ? <IconicMenuItem
        onClick={props.loadLocal} icon="hand-drawn-alt-left" label="Return to editing resume" /> :
        <></>

    return (
        <>
            <Modal title="Load File" isOpen={isOpen} close={() => setOpen(false)} className="landing-modal">
                {modalContent}
            </Modal>
            <div id="landing">
                <h2>Getting Started</h2>
                <p>Welcome to Experiencer, a powerful tool that can help you create attractive resumes.</p>
                <p>Click on the <strong>New</strong> button in the top left to get started. Once you start
                    editing your resume, a <strong>Help</strong> button with more information will appear (also in the top left).</p>
                <PureMenu divProps={{ className: "landing-menu" }}>
                    {returnButton}
                    <IconicMenuItem onClick={() => props.new()} icon="paper" label="New" />
                    <IconicMenuItem onClick={() => setOpen(true)} icon="folder-open" label="Load" />
                </PureMenu>
            </div>
        </>
    );
}