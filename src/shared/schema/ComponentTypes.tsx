import Grid from "@/resume/Grid";
import Row from "@/resume/Row";
import Column from "@/resume/Column";
import Section from "@/resume/Section";
import Entry, { BasicEntryProps } from "@/resume/Entry";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";
import DescriptionList, { DescriptionListItem, BasicDescriptionItemProps, DescriptionListType, DescriptionListItemType } from "@/resume/List";
import { IconType } from "@/resume/Icon";
import Header from "@/resume/Header";
import { BasicResumeNode } from "@/types";

export interface NodeInformation {
    text: string;
    node: BasicResumeNode & Record<string, any>;
    icon?: string;
}

/** Stores schema information */
export default class ComponentTypes {

    /**
     * Given a type return what children its allowed to have
     * @param type Type of resume node
     */
    static childTypes(type: string) : string | Array<string> {
        switch (type) {
            case Grid.type:
                return [
                    Row.type,
                    Column.type,
                    Section.type,
                    Entry.type,
                    MarkdownText.type,
                    Link.type,
                    AliasTypes.BulletedList,
                    DescriptionListType,
                    IconType
                ];
            case Row.type:
                return Column.type;
            case Column.type:
                return [
                    Row.type,
                    Grid.type,
                    Section.type,
                    Entry.type,
                    MarkdownText.type,
                    Link.type,
                    AliasTypes.BulletedList,
                    DescriptionListType
                ]
            case DescriptionListType:
                return DescriptionListItemType;
            case DescriptionListItemType:
            case Link.type:
                return [];
            case Entry.type:
                return [
                    AliasTypes.BulletedList,
                    DescriptionListType,
                    MarkdownText.type,
                    Link.type
                ];
            case Header.type:
                return [
                    Entry.type,
                    MarkdownText.type,
                    Link.type,
                    AliasTypes.BulletedList,
                    DescriptionListType,
                    Grid.type
                ];
            case Section.type:
                return [
                    Section.type,
                    Entry.type,
                    MarkdownText.type,
                    Link.type,
                    AliasTypes.BulletedList,
                    DescriptionListType,
                    Grid.type,
                    Row.type
                ]
            default:
                return [
                    Section.type,
                    Entry.type,
                    MarkdownText.type,
                    Link.type,
                    AliasTypes.BulletedList,
                    DescriptionListType
                ];
        }
    }

    /**
     * Given a node type return its corresponding path in the 
     * CSS settings
     * @param type
     */
    static cssName(type: string) : string[] {
        switch (type) {
            case DescriptionListType:
                return ['Description List'];
            case DescriptionListItemType:
                return ['Description List'];
            case MarkdownText.type:
                return ['Markdown'];
            case Column.type:
                return [Column.type];
            default:
                return [type];
        }
    }

    /**
     * Given a type retrieve its JSON representation
     * @param type
     */
    static defaultValue(type: string) : NodeInformation {
        switch (type) {
            case AliasTypes.BulletedList:
                return {
                    text: 'Bulleted List',
                    node: {
                        type: MarkdownText.type,
                        value: '- ',
                        hideBullets: false
                    },
                    icon: 'list-dots',
                }
            case Column.type:
                return {
                    text: Column.type,
                    node: {
                        type: Column.type
                    },
                    icon: 'swoosh-down'
                }
            case DescriptionListType:
                return {
                    text: 'Description List',
                    node: {
                        type: DescriptionListType,
                        childNodes: [
                            {
                                type: DescriptionListItemType,
                                definitions: ['']
                            } as BasicDescriptionItemProps
                        ]
                    },
                    icon: 'sub-listing'
                }
            case DescriptionListItemType:
                return {
                    text: 'Description List Item',
                    node: { type: DescriptionListItemType }
                }
            case Entry.type:
                return {
                    text: 'Entry',
                    node: {
                        type: Entry.type,
                        title: [''],
                        subtitle: ['']
                    } as BasicEntryProps,
                    icon: 'calendar'
                }
            case Grid.type:
                return {
                    text: 'Grid',
                    node: {
                        type: Grid.type
                    },
                    icon: 'table'
                }
            case MarkdownText.type:
                return {
                    text: 'Markdown',
                    node: {
                        type: MarkdownText.type
                    },
                    icon: 'paragraph'
                }
            case Row.type:
                return {
                    text: Row.type,
                    node: {
                        type: Row.type,
                        childNodes: [
                            { type: Column.type },
                            { type: Column.type }
                        ]
                    },
                    icon: 'swoosh-right',
                }
            case Section.type:
                return {
                    text: Section.type,
                    node: {
                        type: Section.type
                    },
                    icon: 'book-mark'
                }
            case IconType:
                return {
                    text: IconType,
                    node: {
                        type: IconType
                    }
                }
            case Link.type:
                return {
                    text: 'Link',
                    node: {
                        type: Link.type,
                        value: '',
                        url: ''
                    } as BasicResumeNode & { url: string },
                    icon: 'link'
                }
            default:
                throw new Error(`Couldn't find information for component named ${type}`);
        }
    }
}

class AliasTypes {
    static readonly BulletedList = 'Bulleted List';
}