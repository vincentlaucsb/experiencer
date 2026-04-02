import ComponentTypes, { AliasTypes } from "./ComponentTypes";
import DefaultChildren from "./DefaultChildren";
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
import DescriptionList, { BasicDescriptionItemProps, DescriptionListType, DescriptionListItemType, DescriptionListItem } from "@/resume/List";
import Icon, { IconType } from "@/resume/Icon";
import Header from "@/resume/Header";
import getEntryToolbarOptions from "../Entry/toolbarOptions";
import getHeaderToolbarOptions from "../Header/toolbarOptions";
import getGridToolbarOptions from "../Grid/toolbarOptions";
import getColumnToolbarOptions from "../Column/toolbarOptions";
import getRowToolbarOptions from "../Row/toolbarOptions";
import getLinkToolbarOptions from "../Link/toolbarOptions";
import getIconToolbarOptions from "../Icon/toolbarOptions";
import getDescriptionListItemToolbarOptions from "../List/DescriptionListItemToolbarOptions";
import { ResumeNode } from "@/types";

/**
 * Registers all resume node types with their schema definitions.
 * 
 * This is the central place where all resume node types are defined and registered, including their
 * allowed child types, default values, and toolbar options. By keeping this logic in one place, we can easily manage
 * the structure and behavior of all resume components without scattering this information across multiple files.
 */
export default function registerNodes() {
    const schema = ComponentTypes.instance;

    schema.registerNodeType({
        component: Grid,
        type: Grid.type,
        text: 'Grid',
        icon: 'table',
        childTypes: [
            Row.type,
            Column.type,
            Section.type,
            Entry.type,
            MarkdownText.type,
            Link.type,
            AliasTypes.BulletedList,
            DescriptionListType,
            Group.type,
            IconType,
            Image.type
        ],
        defaultValue: {},
        toolbarOptions: getGridToolbarOptions
    });

    schema.registerNodeType({
        component: Row,
        type: Row.type,
        text: 'Row',
        icon: 'swoosh-right',
        childTypes: DefaultChildren.create().plus([Column.type, Group.type]),
        defaultValue: {
            childNodes: [
                { type: Column.type },
                { type: Column.type }
            ]
        },
        toolbarOptions: getRowToolbarOptions
    });

    schema.registerNodeType({
        component: Column,
        type: Column.type,
        text: 'Column',
        icon: 'swoosh-down',
        childTypes: [
            Row.type,
            Grid.type,
            Section.type,
            Entry.type,
            MarkdownText.type,
            Link.type,
            AliasTypes.BulletedList,
            DescriptionListType,
            Group.type,
            Image.type
        ],
        defaultValue: {},
        toolbarOptions: getColumnToolbarOptions
    });

    schema.registerNodeType({
        component: Section,
        type: Section.type,
        text: 'Section',
        icon: 'book-mark',
        treeClassNames: 'tree-item-section',
        treeRepresentation: (node) => node.value || node.type,
        childTypes: [
            Section.type,
            Entry.type,
            MarkdownText.type,
            Link.type,
            AliasTypes.BulletedList,
            DescriptionListType,
            Grid.type,
            Row.type,
            Group.type,
            Image.type
        ],
        defaultValue: {},
        isDefaultChildType: true
    });

    schema.registerNodeType({
        component: Entry,
        type: Entry.type,
        text: 'Entry',
        icon: 'calendar',
        isDefaultChildType: true,
        treeClassNames: 'tree-item-entry',
        treeRepresentation: (node) => {
            const entryNode = node as ResumeNode<BasicEntryProps>;
            return entryNode.title?.[0] || node.type;
        },
        childTypes: [
            AliasTypes.BulletedList,
            DescriptionListType,
            MarkdownText.type,
            Link.type,
            Group.type,
            Image.type
        ],
        defaultValue: {
            type: Entry.type,
            title: [''],
            subtitle: ['']
        } as BasicEntryProps,
        toolbarOptions: getEntryToolbarOptions
    });

    schema.registerNodeType({
        component: MarkdownText,
        type: MarkdownText.type,
        text: 'Markdown',
        icon: 'paragraph',
        childTypes: [],
        defaultValue: {},
        isDefaultChildType: true,
        isEditable: true
    });

    schema.registerNodeType({
        component: Link,
        type: Link.type,
        text: 'Link',
        icon: 'link',
        treeRepresentation: (node) => {
            const linkNode = node as ResumeNode<{ url?: string }>;
            return node.value || linkNode.url || node.type;
        },
        childTypes: [],
        defaultValue: {
            value: '',
            url: ''
        },
        isDefaultChildType: true,
        isEditable: true,
        toolbarOptions: getLinkToolbarOptions
    });

    schema.registerNodeType({
        component: Group,
        type: Group.type,
        text: 'Group',
        childTypes: DefaultChildren.create().plus([
            Grid.type,
            Row.type,
            Column.type,
            Group.type,
            IconType,
        ]),
        defaultValue: {}
    });

    schema.registerNodeType({
        component: PageBreak,
        type: PageBreak.type,
        cssName: 'Page Break',
        text: 'Page Break',
        icon: 'line-block',
        treeRepresentation: 'Page Break',
        childTypes: [],
        defaultValue: {}
    });

    schema.registerNodeType({
        component: Header,
        type: Header.type,
        text: 'Header',
        childTypes: [
            Entry.type,
            MarkdownText.type,
            Link.type,
            AliasTypes.BulletedList,
            DescriptionListType,
            Grid.type,
            Group.type,
            Image.type
        ],
        defaultValue: {},
        isEditable: true,
        toolbarOptions: getHeaderToolbarOptions
    });

    schema.registerNodeType({
        component: DescriptionList,
        type: DescriptionListType,
        text: 'Description List',
        icon: 'sub-listing',
        childTypes: DescriptionListItemType,
        defaultValue: {
            type: DescriptionListType,
            childNodes: [
                {
                    type: DescriptionListItemType,
                    definitions: ['']
                } as BasicDescriptionItemProps
            ]
        },
        isDefaultChildType: true
    });

    schema.registerNodeType({
        component: DescriptionListItem,
        type: DescriptionListItemType,
        text: 'Description List Item',
        childTypes: [],
        defaultValue: {},
        toolbarOptions: getDescriptionListItemToolbarOptions
    });

    schema.registerNodeType({
        component: Icon,
        type: IconType,
        text: 'Icon',
        defaultValue: {},
        toolbarOptions: getIconToolbarOptions
    });

    schema.registerNodeType({
        component: Image,
        type: Image.type,
        text: 'Image',
        icon: 'image',
        isDefaultChildType: true,
        treeRepresentation: (node) => {
            const imageNode = node as ResumeNode<{ altText?: string }>;
            return imageNode.altText || node.value || node.type;
        },
        defaultValue: {
            value: ''
        }
    });

    schema.registerNodeType({
        component: MarkdownText,
        type: AliasTypes.BulletedList,
        text: 'Bulleted List',
        icon: 'list-dots',
        isDefaultChildType: true,
        defaultValue: {
            type: MarkdownText.type,
            value: '- ',
            hideBullets: false
        }
    });
}