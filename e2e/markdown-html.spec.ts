import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('safe HTML formatting survives editing, live preview, reopening, and print', async ({ page, context }) => {
  await context.addInitScript(() => { window.print = () => undefined; });
  await createResumeFromTemplate(page);
  const markdown = page.locator('#resume .text-content').first();
  await markdown.click();
  await markdown.click();
  const source = 'A <mark onclick="window.htmlExecuted=true" style="color:red" id="spoof" class="custom-highlight 2xl:accent">highlighted</mark> '
    + 'and <u>underlined</u> achievement with **bold** and <sup>2</sup>.\n\n'
    + '<script>window.htmlExecuted=true</script>\n\n'
    + '<iframe srcdoc="<script>parent.htmlExecuted=true</script>"></iframe>\n\n'
    + '<a href="javascript:window.htmlExecuted=true">Unsafe link</a> '
    + '<a href="https://example.com">Safe link</a> '
    + '<img src="x" onerror="window.htmlExecuted=true">\n\n'
    + '`<u>literal code</u>`\n\n## Code example\n\n```js\nconst example = 1;\n```\n\n'
    + '<!--rehype:onclick=window.htmlExecuted=true&style=color:red-->\n\n'
    + '[Metadata link](https://example.com)rehype:href=javascript:window.htmlExecuted=true\n\n'
    + '[Styled link](https://example.com)rehype:style=color:red\n\n'
    + '[Escaped link](https://example.com)&lt;!--rehype:id=spoof--&gt;\n\n'
    + '| Skill | Level |\n| --- | --- |\n| TypeScript | Expert |\n\n- [x] Reviewed\n- [ ] Draft';
  await page.getByLabel('Text content').fill(source);
  await page.getByRole('button', { name: 'Preview code (ctrl + 9)', exact: true }).click();
  const preview = page.locator('.w-md-editor-preview');
  await expect(preview.locator('mark')).toHaveText('highlighted');
  await expect(preview.locator('u')).toHaveText('underlined');
  await expect(preview.locator('script, iframe, [onclick], [onerror], #spoof')).toHaveCount(0);
  await expect(preview.locator('mark')).toHaveClass('custom-highlight 2xl:accent');
  await expect(preview.locator('code .token.keyword')).toHaveText('const');
  const headingLink = preview.locator('h2 a.anchor');
  await expect(headingLink).toHaveAttribute('href', '#code-example');
  await expect(preview.locator('h2#code-example')).toHaveText('Code example');
  await expect(preview.locator('table th')).toHaveText(['Skill', 'Level']);
  await expect(preview.locator('input[type="checkbox"]')).toHaveCount(2);
  await expect(preview.locator('input').first()).toBeDisabled();
  await expect(preview.locator('input').first()).toBeChecked();
  // UIW's editor CSS hides its copy affordance, but retain its generated markup.
  await expect(preview.locator('.copied')).toHaveAttribute('data-code', 'const example = 1;\n');
  await expect(preview.locator('.copied svg').first()).toHaveAttribute('viewBox', '0 0 16 16');
  await expect(preview.getByText('Unsafe link', { exact: true })).not.toHaveAttribute('href', /javascript:/i);
  await expect(preview.getByRole('link', { name: 'Metadata link', exact: true })).toHaveAttribute('href', 'https://example.com');
  await expect(preview.getByRole('link', { name: 'Styled link', exact: true })).not.toHaveAttribute('style');
  await expect(preview.getByRole('link', { name: 'Escaped link', exact: true })).not.toHaveAttribute('id');
  await page.getByRole('button', { name: 'Save (Ctrl + Enter)' }).click();
  await expect(markdown.locator('mark')).toHaveCSS('background-color', 'rgb(255, 255, 0)');
  await expect(markdown.locator('u')).toHaveCSS('text-decoration-line', 'underline');
  await expect(markdown.locator('strong')).toHaveText('bold');
  await expect(markdown.locator('code').first()).toHaveText('<u>literal code</u>');
  await expect(markdown.locator('script, iframe, [onclick], [onerror], [style], #spoof')).toHaveCount(0);
  await expect(markdown.locator('mark')).toHaveClass('custom-highlight 2xl:accent');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.save-status')).toContainText('Saved v2');
  // The creation helper clears storage on this page's loads. Reopen in a fresh
  // tab to exercise persistence without rerunning that fixture initialization.
  const reopened = await context.newPage();
  await reopened.goto(page.url());
  await reopened.locator('.resume-library-item').filter({ hasText: 'Integrity' })
    .getByRole('button', { name: 'Open', exact: true }).click();
  await expect(reopened.locator('#resume mark')).toHaveText('highlighted');
  await expect(reopened.locator('#resume u')).toHaveText('underlined');
  await reopened.getByRole('button', { name: 'File' }).click();
  const popupPromise = reopened.waitForEvent('popup');
  await reopened.getByRole('menuitem', { name: 'Print' }).click();
  const print = await popupPromise;
  await expect(print.locator('mark')).toHaveText('highlighted');
  await expect(print.locator('u')).toHaveCSS('text-decoration-line', 'underline');
  await expect(print.locator('script, iframe, [onclick], [onerror], #spoof')).toHaveCount(0);
  await expect(print.locator('mark')).toHaveClass('custom-highlight 2xl:accent');
  expect(await page.evaluate(() => (window as any).htmlExecuted)).toBeUndefined();
  expect(await print.evaluate(() => (window as any).htmlExecuted)).toBeUndefined();
});
