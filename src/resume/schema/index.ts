import ComponentTypes, { AliasTypes } from "./ComponentTypes";
import Grid from "@/resume/Grid";
import Row from "@/resume/Row";
import Column from "@/resume/Column";
import Section from "@/resume/Section";
import Entry, { BasicEntryProps } from "@/resume/Entry";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";
import Image from "@/resume/Image";
import Divider from "@/resume/Divider";
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
        childTypes: Column.type,
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
        childTypes: [
            Section.type,
            Entry.type,
            MarkdownText.type,
            Link.type,
            AliasTypes.BulletedList,
            DescriptionListType,
            Grid.type,
            Row.type,
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
        childTypes: [
            AliasTypes.BulletedList,
            DescriptionListType,
            MarkdownText.type,
            Link.type,
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
        defaultValue: {},
        isDefaultChildType: true,
        isEditable: true
    });

    schema.registerNodeType({
        component: Link,
        type: Link.type,
        text: 'Link',
        icon: 'link',
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
        component: Divider,
        type: Divider.type,
        text: 'Divider',
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