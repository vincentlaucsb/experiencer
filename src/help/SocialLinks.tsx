import React from "react";

export interface SocialLink {
    href: string;
    label: string;
    imageSrc: string;
    imageAlt: string;
}

/** Renders the landing page's extensible social media link bar. */
export default function SocialLinks(props: { links: SocialLink[] }) {
    return (
        <nav className="landing-social" aria-label="Social media">
            <ul>
                {props.links.map((link) => (
                    <li key={link.href}>
                        <a href={link.href} aria-label={link.label}>
                            <img src={link.imageSrc} alt={link.imageAlt} />
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
