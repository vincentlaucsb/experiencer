import type { TemplateStartingPoint } from '@/shared/templates/templateStartingPoint';
import { randyMarsh } from './RandyMarsh';
import { integrityProfessionalNodes } from './IntegrityProfessional';

/** Each family owns its alternatives. Absence means the template has its one original starting point. */
export const builtinTemplateStartingPoints: Readonly<Record<string, readonly TemplateStartingPoint[]>> = {
    Integrity: [
        {id: 'sample', label: 'Sample (fun)', createContent: randyMarsh},
        {id: 'professional', label: 'Sample (professional)', createContent: integrityProfessionalNodes}
    ]
};
