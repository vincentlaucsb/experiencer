import { rootPalette, type TemplateTheme, type TemplateThemeTransform } from '@/shared/templates/templateTheme';

/** Carries Assured's palette into the shared header, including cover letters without sections. */
function assuredPalette(accent: string, background: string): TemplateThemeTransform {
    return css => {
        rootPalette({ '--accent': accent })(css);
        css.builtinCss.mustFindNode('Header').setProperties(current =>
            new Map([...current, ['background', background]]));
        return css;
    };
}

const assured: readonly TemplateTheme[] = [
    { id: 'original', name: 'Original', fill: '#315eaa', transform: css => css },
    { id: 'forest', name: 'Forest', fill: '#28634e', transform: assuredPalette('#28634e', '#e4eee8') },
    { id: 'plum', name: 'Plum', fill: '#704367', transform: assuredPalette('#704367', '#efe5ed') },
    { id: 'copper', name: 'Copper', fill: '#8b4d2e', transform: assuredPalette('#8b4d2e', '#f3e7de') }
];

const integrity: readonly TemplateTheme[] = [
    { id: 'original', name: 'Original', fill: 'linear-gradient(135deg, #4eb3b9 50%, #fbdcb6 50%)', transform: css => css },
    { id: 'ocean', name: 'Ocean', fill: 'linear-gradient(135deg, #639bc8 50%, #dcebf5 50%)',
        transform: rootPalette({ '--randy-teal': '#639bc8', '--secondary-color': '#dcebf5', '--text-color': '#25394b' }) },
    { id: 'forest', name: 'Forest', fill: 'linear-gradient(135deg, #76a58a 50%, #e4ebd6 50%)',
        transform: rootPalette({ '--randy-teal': '#76a58a', '--secondary-color': '#e4ebd6', '--text-color': '#2b4033' }) },
    { id: 'plum', name: 'Plum', fill: 'linear-gradient(135deg, #b58bab 50%, #f0dfeb 50%)',
        transform: rootPalette({ '--randy-teal': '#b58bab', '--secondary-color': '#f0dfeb', '--text-color': '#493448' }) }
];

export const builtinTemplateThemes: Readonly<Record<string, readonly TemplateTheme[]>> = {
    Assured: assured,
    'Assured: Cover Letter': assured,
    Integrity: integrity,
    'Integrity: Cover Letter': integrity
};
