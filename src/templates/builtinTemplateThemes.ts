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

const candor: readonly TemplateTheme[] = [
    { id: 'original', name: 'Original', fill: 'linear-gradient(135deg, #33478c 50%, #f4ede3 50%)', transform: css => css },
    { id: 'evergreen', name: 'Evergreen', fill: 'linear-gradient(135deg, #2f5d50 50%, #eef0e6 50%)',
        transform: rootPalette({ '--accent': '#2f5d50', '--marker': '#9a5f1f', '--panel': '#eef0e6', '--panel-rule': '#d3d9c6', '--rule': '#cdd6cf', '--ink': '#1f2a26', '--meta': '#55605b' }) },
    { id: 'merlot', name: 'Merlot', fill: 'linear-gradient(135deg, #6e2c43 50%, #f6ece9 50%)',
        transform: rootPalette({ '--accent': '#6e2c43', '--marker': '#a5532d', '--panel': '#f6ece9', '--panel-rule': '#e2cfc8', '--rule': '#dccdd1', '--ink': '#2b2125', '--meta': '#635559' }) },
    { id: 'slate', name: 'Slate', fill: 'linear-gradient(135deg, #34495e 50%, #ecf0f2 50%)',
        transform: rootPalette({ '--accent': '#34495e', '--marker': '#2f7d78', '--panel': '#ecf0f2', '--panel-rule': '#d2dadf', '--rule': '#d0d6dc', '--ink': '#1f2830', '--meta': '#56606a' }) }
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
    Candor: candor,
    'Candor: Cover Letter': candor,
    Integrity: integrity,
    'Integrity: Cover Letter': integrity
};
