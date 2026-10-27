import type { BasicResumeNode, ResumeSaveData } from '@/types';
import { assignIds } from '@/shared/utils/assignIds';

/** A template-authored content tree; layout, theme, fonts and paper remain on the selected template. */
export interface TemplateStartingPoint {
    id: string;
    label: string;
    createContent(): BasicResumeNode[];
}

/** Replaces only authored content and gives each new document an independent node identity tree. */
export function applyTemplateStartingPoint(data: ResumeSaveData, point: TemplateStartingPoint): ResumeSaveData {
    return {...data, childNodes: assignIds(JSON.parse(JSON.stringify(point.createContent())) as BasicResumeNode[])};
}
