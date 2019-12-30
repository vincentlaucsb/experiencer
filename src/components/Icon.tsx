import React from "react";
import MapPin from "../icons/feather/map-pin.svg";
import Globe from "../icons/feather/globe.svg";
import Email from "../icons/feather/mail.svg";
import LinkedIn from "../icons/LI-In-Bug.png";
import GitHubDark from "../icons/GitHub-Mark-120px-plus.png";
import Phone from "../icons/feather/phone.svg";
import { selectTriggerProps } from "./Container";
import ResumeNodeProps from "./ResumeNodeProps";
import { BasicResumeNode } from "./utility/Types";

interface IconBase {
    icon?: 'email'
    | 'github'
    | 'globe'
    | 'linkedin'
    | 'map-pin'
    | 'phone';
};

export interface BasicIconProps extends IconBase, BasicResumeNode {}
export interface IconProps extends IconBase, ResumeNodeProps {}

export default class Icon extends React.PureComponent<IconProps> {
    static readonly type = 'Icon';

    render() {
        let src = '';

        switch (this.props.icon) {
            case 'email':
                src = Email;
                break;
            case 'github':
                src = GitHubDark;
                break;
            case 'globe':
                src = Globe;
                break;
            case 'linkedin':
                src = LinkedIn;
                break;
            case 'map-pin':
                src = MapPin;
                break;
            case 'phone':
                src = Phone;
                break;
            default:
                src = '';
                break;
        }

        return <img className="icon" src={src} alt="Icon"
            {...selectTriggerProps(this.props)}
        />
    }
}