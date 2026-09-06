import type { TemplateTheme } from '@/shared/templates/templateTheme';

/** Native radio controls provide keyboard selection and expose names independently of color. */
export function TemplateThemeSelector(props: {
    themes: readonly TemplateTheme[];
    selectedId?: string;
    disabled: boolean;
    select(id: string): void;
}) {
    if (!props.themes.length) return null;
    const selected = props.themes.find(theme => theme.id === props.selectedId);
    return (
        <fieldset className="template-theme-selector" disabled={props.disabled}>
            <legend>Theme{selected ? ` · ${selected.name}` : ''}</legend>
            <div className="template-theme-swatches">
                {props.themes.map(theme => (
                    <label key={theme.id} className="template-theme-option" title={theme.name}>
                        <input type="radio" name="template-theme" value={theme.id}
                            aria-label={theme.name} checked={theme.id === props.selectedId}
                            onChange={() => props.select(theme.id)} />
                        <span className="template-theme-fill" style={{ background: theme.fill }} aria-hidden="true" />
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
