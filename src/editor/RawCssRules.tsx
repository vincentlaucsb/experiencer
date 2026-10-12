import { localKeyboardScopeAttributes } from '@/shared/ui/localKeyboardScope';
import { Button } from '@/controls/Buttons';
import { useCssStore } from '@/shared/stores/cssStoreHooks';
import { getInspectableCssRules, type CssRuleTarget } from '@/shared/utils/cssRuleInspection';
import './CssEditor.scss';

interface RawCssRulesProps {
    stylesheet: string;
    onInspect: (target: CssRuleTarget) => void;
}

/** Shows serialized CSS alongside a keyboard-accessible link to each rule's owner. */
export default function RawCssRules({ stylesheet, onInspect }: RawCssRulesProps) {
    const { css, rootCss } = useCssStore();
    const rules = getInspectableCssRules(css, rootCss);
    // A consumer may supply a stylesheet outside the editor stores. Keep that
    // text intact and never offer navigation to unrelated store-owned rules.
    if (stylesheet !== `${rootCss.stylesheet()}\n\n${css.stylesheet()}`) {
        return <pre><code>{stylesheet}</code></pre>;
    }
    return <div {...localKeyboardScopeAttributes} className="raw-css-rules">
        {rules.map(rule => <div className="raw-css-rule app-gap-2 app-mb-4"
            key={JSON.stringify([rule.target.tree, rule.path])}>
            <pre className="app-m-0"><code>{rule.stylesheet}</code></pre>
            <Button type="button" aria-label={`Edit ${rule.target.owner.mustFindNode(rule.path).fullSelector} in CSS`}
                title="Open rule in CSS" onClick={() => onInspect(rule.target)}>
                <i className="icofont-ui-edit" aria-hidden="true" />
            </Button>
        </div>)}
    </div>;
}
