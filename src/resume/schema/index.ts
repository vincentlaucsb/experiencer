import ComponentTypes, { AliasTypes } from "./ComponentTypes";
import Grid from "@/resume/Grid";
import Row from "@/resume/Row";
import Column from "@/resume/Column";
import Section from "@/resume/Section";
import Entry, { BasicEntryProps } from "@/resume/Entry";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";
import Image from "@/resume/Image";
import Group from "@/resume/Group";
import PageBreak from "@/resume/PageBreak";
import DescriptionList, { DescriptionListType, DescriptionListItemType, DescriptionListItem } from "@/resume/List";
import Icon, { IconType } from "@/resume/Icon";
import Header from "@/resume/Header";
import getEntryToolbarOptions from "../Entry/toolbarOptions";
import getHeaderToolbarOptions from "../Header/toolbarOptions";
import getGridToolbarOptions from "../Grid/toolbarOptions";
import getColumnToolbarOptions from "../Column/toolbarOptions";
import getRowToolbarOptions from "../Row/toolbarOptions";
import getLinkToolbarOptions from "../Link/toolbarOptions";
import getLinkContextMenuOptions from "../Link/contextMenuOptions";
import getIconToolbarOptions from "../Icon/toolbarOptions";
import getDescriptionListItemToolbarOptions from "../List/DescriptionListItemToolbarOptions";
import { ResumeNode } from "@/types";
import { portableRegistration, PortableNodeViewDefinition } from "./structuralManifest";

/**
 * Registers all resume node types with their schema definitions.
 * 
 * This is the central place where all resume node types are defined and registered, including their
 * allowed child types, default values, and toolbar options. By keeping this logic in one place, we can easily manage
 * the structure and behavior of all resume components without scattering this information across multiple files.
 */
export default function registerNodes() {
    const schema = ComponentTypes.instance;
    const register = (kind: string, view: PortableNodeViewDefinition) => schema.registerNodeType({
        ...portableRegistration(kind),
        ...view
    });

    register(Grid.type, {
        component: Grid,
        text: 'Grid',
        icon: 'table',
        toolbarOptions: getGridToolbarOptions
    });

    register(Row.type, {
        component: Row,
        text: 'Row',
        icon: 'swoosh-right',
        toolbarOptions: getRowToolbarOptions
    });

    register(Column.type, {
        component: Column,
        text: 'Column',
        icon: 'swoosh-down',
        toolbarOptions: getColumnToolbarOptions
    });

    register(Section.type, {
        component: Section,
        text: 'Section',
        icon: 'book-mark',
        treeClassNames: 'tree-item-section',
        treeRepresentation: (node) => node.value || node.type
    });

    register(Entry.type, {
        component: Entry,
        text: 'Entry',
        icon: 'calendar',
        treeClassNames: 'tree-item-entry',
        treeRepresentation: (node) => {
            const entryNode = node as ResumeNode<BasicEntryProps>;
            return entryNode.title?.[0] || node.type;
        },
        toolbarOptions: getEntryToolbarOptions
    });

    register(MarkdownText.type, {
        component: MarkdownText,
        text: 'Text',
        icon: 'paragraph',
        treeRepresentation: 'Text'
    });

    register(Link.type, {
        component: Link,
        text: 'Link',
        icon: 'link',
        treeRepresentation: (node) => {
            const linkNode = node as ResumeNode<{ url?: string }>;
            return node.value || linkNode.url || node.type;
        },
        contextMenuOptions: getLinkContextMenuOptions,
        toolbarOptions: getLinkToolbarOptions
    });

    register(Group.type, {
        component: Group,
        text: 'Group'
    });

    register(PageBreak.type, {
        component: PageBreak,
        cssName: 'Page Break',
        text: 'Page Break',
        icon: 'line-block',
        treeRepresentation: 'Page Break'
    });

    register(Header.type, {
        component: Header,
        text: 'Header',
        toolbarOptions: getHeaderToolbarOptions
    });

    register(DescriptionListType, {
        component: DescriptionList,
        text: 'Description List',
        icon: 'sub-listing',
    });

    register(DescriptionListItemType, {
        component: DescriptionListItem,
        text: 'Description List Item',
        toolbarOptions: getDescriptionListItemToolbarOptions
    });

    register(IconType, {
        component: Icon,
        text: 'Icon',
        toolbarOptions: getIconToolbarOptions
    });

    register(Image.type, {
        component: Image,
        text: 'Image',
        icon: 'image',
        treeRepresentation: (node) => {
            const imageNode = node as ResumeNode<{ altText?: string }>;
            return imageNode.altText || node.value || node.type;
        }
    });

    register(AliasTypes.BulletedList, {
        component: MarkdownText,
        text: 'Bulleted List',
        icon: 'list-dots',
    });
}
