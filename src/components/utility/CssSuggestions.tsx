export default class CssSuggestions {
    private static _properties: Map<string, Array<string>> | undefined =
        undefined;

    static get properties(): Map<string, Array<string>> {
        if (!CssSuggestions._properties) {
            CssSuggestions._properties = CssSuggestions.generateProperties();
        }

        return CssSuggestions._properties;
    }
    
    private static generateProperties() {
        let properties = new Map<string, Array<string>>([
            ['align-content', ['start', 'center', 'space-between', 'space-around']],
            ['align-items',
                ['normal', 'stretch', 'center', 'start', 'end', 'flex-start',
                    'flex-end']
            ],
            ['background', new Array<string>()],
            ['border', new Array<string>()],
            ['border-bottom', new Array<string>()],
            ['border-left', new Array<string>()],
            ['border-radius', new Array<string>()],
            ['border-right', new Array<string>()],
            ['border-top', new Array<string>()],
            ['color', new Array<string>()],
            ['content', new Array<string>()],
            ['display', new Array<string>()],
            ['flex-basis', []],
            ['flex-direction',
                ['column', 'column-reverse', 'row', 'row-reverse']
            ],
            ['flex-flow', []],
            ['flex-grow', []],
            ['flex-shrink', []],
            ['flex-wrap', ['nowrap', 'wrap', 'wrap-reverse']],
            ['float', []],
            ['font-family', new Array<string>()],
            ['font-size',
                [
                    'xx-small', 'x-small', 'small', 'medium',
                    'large', 'x-large', 'xx-large', 'xxx-large',
                    'smaller', 'larger'
                ]
            ],
            ['font-size-adjust', ['none']],
            ['font-stretch',
                [
                    'ultra-condensed', 'extra-condensed', 'condensed',
                    'semi-condensed', 'normal', 'semi-expanded', 'expanded',
                    'extra-expanded', 'ultra-expanded'
                ]],
            ['font-style', ['normal', 'italic', 'oblique']],
            ['font-variant', []],
            ['font-weight', ['normal', 'bold', 'lighter', 'bolder']],
            ['grid-column-gap', new Array<string>()],
            ['grid-row-gap', new Array<string>()],
            ['grid-template-columns', new Array<string>()],
            ['grid-template-row', new Array<string>()],
            ['height', new Array<string>()],
            ['hyphens',
                ['none', 'manual', 'auto']],
            ['justify-content',
                ['center', 'start', 'end', 'flex-start', 'flex-end', 'left', 'right',
                    'normal', 'space-between', 'space-around', 'space-evenly', 'stretch']
            ],
            ['letter-spacing', ['normal']],
            ['line-height', ['normal']],
            ['list-style', [
                'disc', 'circle', 'square', 'decimal',
                'decimal-leading-zero',
                'lower-roman', 'upper-roman', 'lower-greek',
                'lower-alpha', 'lower-latin', 'upper-alpha', 'upper-latin',
                'none'
            ]],

            // TODO: Copy values for list-style
            ['list-style-type', ['disc']],
            ['list-style-position', ['inside', 'outside']],
            ['margin', new Array<string>()],
            ['margin-bottom', new Array<string>()],
            ['margin-left', new Array<string>()],
            ['margin-right', new Array<string>()],
            ['margin-top', new Array<string>()],
            ['max-height', []],
            ['max-width', []],
            ['min-height', []],
            ['min-width', []],
            ['object-fit', ['contain', 'cover', 'fill', 'none', 'scale-down']],
            ['object-position', []],
            ['opacity', []],
            ['order', []],
            ['overflow-wrap',
                ['normal', 'anywhere', 'break-word']],
            ['padding', new Array<string>()],
            ['padding-bottom', new Array<string>()],
            ['padding-left', new Array<string>()],
            ['padding-right', new Array<string>()],
            ['padding-top', new Array<string>()],
            ['position', []],
            ['text-align',
                ['left', 'right', 'center', 'justify']],
            ['text-decoration', []],
            ['text-decoration-color', []],
            ['text-decoration-line', ['none', 'underline', 'overline', 'line-through']],
            ['text-decoration-style', ['solid', 'double', 'dotted', 'dashed', 'wavy']],
            ['text-decoration-thickness', []],
            ['text-indent', ['hanging']],
            ['text-transform',
                ['capitalize', 'uppercase', 'lowercase', 'none', 'full-width',
                    'full-size-kana']],
            ['width', new Array<string>()],
            ['word-break', ['normal', 'break-all', 'keep-all']],
            ['word-spacing', ['normal']]
        ]);

        /** Copy properties */
        let alignItems = properties.get('align-items');
        if (alignItems) {
            properties.set('align-self', alignItems);
        }

        return properties;
    }
}