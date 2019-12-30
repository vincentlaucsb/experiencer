import React from "react";
import HotkeysHelp from "./HotkeysHelp";
import HelpPage from "./HelpPage";
import SavingHelp from "./SavingHelp";
import StartHelp from "./StartHelp";
import PureMenu, { PureMenuItem, PureMenuLink } from "../controls/menus/PureMenu";
import { Action } from "../utility/Types";

interface HelpProps {
    close: Action;
}

type HelpPageName = 'home' | 'hotkeys' | 'saving' | 'start';

export default function Help(props: HelpProps) {
    let [page, setPage] = React.useState('home' as HelpPageName);

    /** Return props for the various help pages */
    const pageProps = {
        close: props.close,
        returnHome: () => setPage('home')
    };

    const MenuItem = (props: any) => <PureMenuItem onClick={props.onClick}>
        <PureMenuLink>{props.children}</PureMenuLink>
    </PureMenuItem>

    switch (page) {
        case 'hotkeys':
            return <HotkeysHelp {...pageProps} />
        case 'saving':
            return <SavingHelp {...pageProps} />
        case 'start':
            return <StartHelp {...pageProps} />
        default:
            return <HelpPage close={props.close} title="Help">
                <PureMenu>
                    <MenuItem onClick={() => setPage('start')}>Getting Started</MenuItem>
                    <MenuItem onClick={() => setPage('saving')}>Saving and Printing</MenuItem>
                    <MenuItem onClick={() => setPage('hotkeys')}>Keyboard Shortcuts</MenuItem>
                </PureMenu>
            </HelpPage>
    }
}