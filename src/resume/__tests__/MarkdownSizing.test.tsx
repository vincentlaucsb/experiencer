import { render, screen } from '@testing-library/react';
import path from 'node:path';

// Bypass the global editor mock: it omits the nested sizing wrappers entirely.
// These internal imports intentionally characterize the installed UIW version.
const packageRoot = path.dirname(require.resolve('@uiw/react-md-editor/package.json'));
const { createTextArea } = require(path.join(packageRoot, 'lib/components/TextArea/factory.js'));
const { EditorContext } = require(path.join(packageRoot, 'lib/Context.js'));
// With highlighting disabled the real factory never renders a Markdown component.
const TextArea = createTextArea({ useMinHeight: true });

describe('UIW unhighlighted textarea sizing prerequisites', () => {
  test.each(['', 'Short text', 'Paragraph\n\n'.repeat(20)])(
    'keeps a fixed minimum-height wrapper without an in-flow content mirror (%#)',
    (markdown) => {
      const { container } = render(
        <EditorContext.Provider value={{ markdown, minHeight: 100, highlightEnable: false }}>
          <TextArea prefixCls="w-md-editor" aria-label="Text content" />
        </EditorContext.Provider>,
      );

      const input = screen.getByLabelText('Text content') as HTMLTextAreaElement;
      const wrapper = container.querySelector('.w-md-editor-text') as HTMLElement;
      expect(input.value).toBe(markdown);
      expect(wrapper.style.minHeight).toBe('100px');
      expect(wrapper.style.height).toBe('');
      expect(wrapper.children).toHaveLength(1);
      expect(wrapper.firstElementChild).toBe(input);
      expect(input.style.overflow).toBe('auto');
      // JSDOM does not perform layout. The browser test verifies the resulting gap.
    },
  );
});
