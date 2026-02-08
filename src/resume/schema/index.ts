import ComponentTypes, { AliasTypes } from "./ComponentTypes";
import Grid from "@/resume/Grid";
import Row from "@/resume/Row";
import Column from "@/resume/Column";
import Section from "@/resume/Section";
import Entry, { BasicEntryProps } from "@/resume/Entry";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";
import Divider from "@/resume/Divider";
import DescriptionList, { BasicDescriptionItemProps, DescriptionListType, DescriptionListItemType } from "@/resume/List";
import { IconType } from "@/resume/Icon";
import Header from "@/resume/Header";
import getEntryToolbarOptions from "../Entry/toolbarOptions";
import getHeaderToolbarOptions from "../Header/toolbarOptions";
import getGridToolbarOptions from "../Grid/toolbarOptions";
import getColumnToolbarOptions from "../Column/toolbarOptions";
import getRowToolbarOptions from "../Row/toolbarOptions";
import getLinkToolbarOptions from "../Link/toolbarOptions";
import getIconToolbarOptions from "../Icon/toolbarOptions";
import getDescriptionListItemToolbarOptions from "../List/DescriptionListItemToolbarOptions";

/** Registers all resume node types with their schema definitions */
export default function registerNodes() {
    const schema = ComponentTypes.instance;

    schema.registerNodeType({
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
            IconType
        ],
        defaultValue: {},
        toolbarOptions: getGridToolbarOptions
    });

    schema.registerNodeType({
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
            DescriptionListType
        ],
        defaultValue: {},
        toolbarOptions: getColumnToolbarOptions
    });

    schema.registerNodeType({
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
            Row.type
        ],
        defaultValue: {},
        isDefaultChildType: true
    });

    schema.registerNodeType({
        type: Entry.type,
        text: 'Entry',
        icon: 'calendar',
        isDefaultChildType: true,
        childTypes: [
            AliasTypes.BulletedList,
            DescriptionListType,
            MarkdownText.type,
            Link.type
        ],
        defaultValue: {
            type: Entry.type,
            title: [''],
            subtitle: ['']
        } as BasicEntryProps,
        toolbarOptions: getEntryToolbarOptions
    });

    schema.registerNodeType({
        type: MarkdownText.type,
        text: 'Markdown',
        icon: 'paragraph',
        defaultValue: {},
        isDefaultChildType: true,
        isEditable: true
    });

    schema.registerNodeType({
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
        type: Divider.type,
        text: 'Divider',
        defaultValue: {}
    });

    schema.registerNodeType({
        type: Header.type,
        text: 'Header',
        childTypes: [
            Entry.type,
            MarkdownText.type,
            Link.type,
            AliasTypes.BulletedList,
            DescriptionListType,
            Grid.type
        ],
        defaultValue: {},
        isEditable: true,
        toolbarOptions: getHeaderToolbarOptions
    });

    schema.registerNodeType({
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
        type: DescriptionListItemType,
        text: 'Description List Item',
        defaultValue: {},
        toolbarOptions: getDescriptionListItemToolbarOptions
    });

    schema.registerNodeType({
        type: IconType,
        text: 'Icon',
        defaultValue: {},
        toolbarOptions: getIconToolbarOptions
    });

    schema.registerNodeType({
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