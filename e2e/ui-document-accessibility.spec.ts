import { expect, test, type Locator, type Page } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';

function documentFixture(dark: boolean) {
  return {
    childNodes: [{ type: 'Header', value: 'Synthetic Applicant', subtitle: 'Platform Engineer', childNodes: [] }],
    rootCss: { name: ':root', selector: ':root', properties: [], children: [] },
    builtinCss: { name: 'Resume CSS', selector: 'body',
      properties: [['background-color', dark ? '#242527' : '#ffffff'], ['color', dark ? '#f2eee7' : '#151318']],
      children: [{ name: 'Header', selector: 'header', properties: [], children: [
        { name: 'Title Group', selector: '> hgroup', properties: [], children: [
          { name: 'Title', selector: '> h1', properties: [['font-size', '32px'], ['font-family', 'serif']], children: [] },
          { name: 'Subtitle', selector: '> h2', properties: [['font-size', '20px'], ['font-family', 'sans-serif'],
            ['color', dark ? '#ffe08a' : '#2f5d82']], children: [] }
        ] }
      ] }
    ] }
  };
}

async function importFixture(page: Page, dark: boolean) {
  await createResumeFromTemplate(page, 'Assured');
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Import resume JSON', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'authored-header.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(documentFixture(dark))) });
  await expect(page.locator('#resume header h1')).toHaveText('Synthetic Applicant');
}

async function editHeader(page: Page) {
  const header = page.locator('#resume header');
  if (await header.getAttribute('data-selected') !== 'true') {
    await header.locator('h1').click();
    await expect(header).toHaveAttribute('data-selected', 'true');
  }
  // Selecting a short imported document changes toolbar geometry before the next click.
  await header.locator('h1').click();
  await expect(header.getByRole('textbox', { name: 'Title', exact: true })).toBeVisible();
}

for (const theme of ['light', 'dark']) {
  for (const paper of ['light', 'dark']) {
    test(`inline header retains authored text and caret colors on ${paper} paper in ${theme} chrome`, async ({ page, context }) => {
      await context.addInitScript(() => { window.print = () => undefined; });
      await importFixture(page, paper === 'dark');
      await page.locator('html').evaluate((element, value) => element.setAttribute('data-theme', value), theme);
      const header = page.locator('#resume header');
      const before = await header.locator('h1, h2').evaluateAll(elements => elements.map(element => {
        const style = getComputedStyle(element);
        return { color: style.color, fontFamily: style.fontFamily, fontSize: style.fontSize };
      }));
      await editHeader(page);
      const title = header.getByRole('textbox', { name: 'Title', exact: true });
      const subtitle = header.getByRole('textbox', { name: 'Subtitle', exact: true });
      for (const [index, field] of [title, subtitle].entries()) {
        await expect(field).toHaveCSS('color', before[index].color);
        await expect(field).toHaveCSS('caret-color', before[index].color);
        await expect(field).toHaveCSS('font-family', before[index].fontFamily);
        await expect(field).toHaveCSS('font-size', before[index].fontSize);
        await expect(field).toHaveCSS('border-bottom-color', before[index].color);
      }
      await subtitle.fill('');
      expect(await subtitle.evaluate(element => getComputedStyle(element, '::placeholder').color)).toBe(before[1].color);
      await subtitle.fill('Platform Engineer');
      await title.fill('Saved Applicant');
      await page.getByRole('button', { name: 'Done', exact: true }).click();
      await expect(header.locator('h1')).toHaveText('Saved Applicant');
      await editHeader(page);
      await title.fill('Cancelled Applicant');
      await title.press('Escape');
      await expect(header.locator('h1')).toHaveText('Saved Applicant');

      if (theme === 'dark' && paper === 'dark') {
        await editHeader(page);
        await page.getByRole('button', { name: 'File', exact: true }).click();
        const popup = page.waitForEvent('popup');
        await page.getByRole('menuitem', { name: /^Print \/ Save as PDF/ }).click();
        const print = await popup;
        await expect(print.locator('header h1')).toHaveText('Saved Applicant');
        await expect(print.locator('header h1')).toHaveCSS('color', before[0].color);
        await expect(print.locator('header h2')).toHaveCSS('color', before[1].color);
        await expect(print.locator('input, .header-edit-actions')).toHaveCount(0);
        await expect(print.locator('html')).not.toHaveAttribute('data-theme');
      }
    });
  }
}

test('isolated résumé iframe silences contact glyphs without dropping meaningful image alternatives', async ({ page }) => {
  await createResumeFromTemplate(page, 'Assured');
  await page.evaluate(async image => {
    const paths = ['/src/templates/ResumeTemplates.tsx', '/src/shared/resumeDocument/prepareResumeDocument.ts',
      '/src/shared/resumeDocument/mountResumeDocument.tsx'];
    const [templates, preparation, mounting] = await Promise.all(paths.map(path => import(path)));
    const data = structuredClone(templates.default.templates.Assured);
    data.childNodes.push({ type: 'Image', value: image, altText: 'Portrait of a synthetic applicant' });
    const prepared = preparation.prepareResumeDocument(preparation.createResumeDocumentSource(data, 'Contact accessibility'), 'isolated-preview');
    const mounted = await mounting.mountResumeDocument(prepared);
    mounted.iframe.id = 'contact-accessibility-preview';
  }, pixel);
  const preview = page.frameLocator('#contact-accessibility-preview');
  await expect(preview.locator('img.icon')).toHaveCount(6);
  await expect(preview.getByRole('img', { name: 'Icon', exact: true })).toHaveCount(0);
  for (const icon of await preview.locator('img.icon').all()) await expect(icon).toHaveAttribute('alt', '');
  await expect(preview.getByRole('img', { name: 'Portrait of a synthetic applicant', exact: true })).toHaveCount(1);
  await expect(preview.locator('body')).toContainText('mynameis@mail.com');
  await expect(preview.locator('html')).not.toHaveAttribute('data-theme');
});

async function textContrast(control: Locator) {
  return control.evaluate(element => {
    const luminance = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => value / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    let background: Element = element;
    while (getComputedStyle(background).backgroundColor === 'rgba(0, 0, 0, 0)' && background.parentElement) background = background.parentElement;
    const foreground = luminance(getComputedStyle(element).color);
    const backdrop = luminance(getComputedStyle(background).backgroundColor);
    return (Math.max(foreground, backdrop) + 0.05) / (Math.min(foreground, backdrop) + 0.05);
  });
}

for (const theme of ['light', 'dark']) {
  test(`shared primary outline text and boundary remain readable on ${theme} application surfaces`, async ({ page }) => {
    await createResumeFromTemplate(page);
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-theme', value), theme);
    // Exercise the real shared stylesheet and Pure cascade; feature CSS must not supply action colors.
    await page.evaluate(() => {
      const fixture = document.createElement('section');
      fixture.id = 'primary-outline-fixture';
      fixture.className = 'app-p-4';
      fixture.innerHTML = ['workspace', 'raised'].map(surface => `<div class="app-p-4" style="background:var(--xp-surface-${surface})">
        <button class="pure-button pure-button-primary pure-button-outline">Outline on ${surface}</button>
        <button class="pure-button pure-button-primary pure-button-outline" disabled>Disabled on ${surface}</button></div>`).join('');
      document.body.append(fixture);
    });
    const fixture = page.locator('#primary-outline-fixture');
    for (const surface of ['workspace', 'raised']) {
      const button = fixture.getByRole('button', { name: `Outline on ${surface}`, exact: true });
      await fixture.hover({ position: { x: 1, y: 1 } });
      await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      expect(await textContrast(button)).toBeGreaterThanOrEqual(4.5);
      const foreground = await button.evaluate(element => getComputedStyle(element).color);
      await expect(button).toHaveCSS('box-shadow', `${foreground} 0px 0px 0px 1px inset`);
      await button.hover();
      await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
      expect(await textContrast(button)).toBeGreaterThanOrEqual(4.5);
      await fixture.hover({ position: { x: 1, y: 1 } });
      await button.focus();
      await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
      expect(await textContrast(button)).toBeGreaterThanOrEqual(4.5);
      await button.blur();
      await expect(fixture.getByRole('button', { name: `Disabled on ${surface}`, exact: true })).toBeDisabled();
    }
  });
}
