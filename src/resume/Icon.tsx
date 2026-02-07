import React from "react";
import MapPin from "@/assets/icons/feather/map-pin.svg?url";
import Globe from "@/assets/icons/feather/globe.svg?url";
import Email from "@/assets/icons/feather/mail.svg?url";
import LinkedIn from "@/assets/icons/LI-In-Bug.png";
import GitHubDark from "@/assets/icons/GitHub-Mark-120px-plus.png";
import Phone from "@/assets/icons/feather/phone.svg?url";
import ResumeComponentProps, { BasicResumeNode } from "@/types";
import Container from "./Container";

interface IconBase {
    icon?: 'email'
    | 'github'
    | 'globe'
    | 'linkedin'
    | 'map-pin'
    | 'phone';
};

export interface BasicIconProps extends IconBase, BasicResumeNode {}
export interface IconProps extends IconBase, ResumeComponentProps {}

export const IconType = "Icon";

export default function Icon(props: IconProps) {
    let src = '';

    switch (props.icon) {
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

    return <Container displayAs="img"
        className="icon"
        attributes={{
            alt: "Icon",
            src: src
        }}

        {...props}
    />
}