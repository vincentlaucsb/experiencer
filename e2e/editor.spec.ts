import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('switches page size and adds a new section', async ({ page }) => {
  await createResumeFromTemplate(page);

  await expect(page.locator('#resume')).toHaveAttribute('data-page-size', 'letter');
  await page.getByRole('button', { name: 'A4' }).click();
  await expect(page.locator('#resume')).toHaveAttribute('data-page-size', 'a4');

  const sectionCount = await page.locator('#resume section').count();
  await page.getByRole('button', { name: 'Insert' }).click();
  await page.getByRole('menuitem', { name: 'Section', exact: true }).click();

  await expect(page.locator('#resume section')).toHaveCount(sectionCount + 1);
  await expect(page.getByRole('heading', { name: 'Enter a title' })).toBeVisible();
});

test('pads an explicit page break to the next physical page', async ({ page }) => {
  await createResumeFromTemplate(page);

  await page.getByRole('button', { name: 'Insert' }).click();
  await page.getByRole('menuitem', { name: 'Page break' }).click();

  const pageBreak = page.locator('#resume .page-break-editing');
  await expect(pageBreak).toBeVisible();
  await page.locator('#resume img').first().evaluate((image: HTMLImageElement) => {
    if (image.complete && image.naturalHeight > 0) return;
    return new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => reject(new Error('Resume image failed to load')), { once: true });
    });
  });
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));

  await expect.poll(async () => pageBreak.evaluate((element) => {
    const resume = document.getElementById('resume');
    if (!resume) return Number.POSITIVE_INFINITY;

    const pageHeight = resume.getBoundingClientRect().width * (11 / 8.5);
    const lineTop = element.getBoundingClientRect().bottom - resume.getBoundingClientRect().top;
    const intoPage = ((lineTop % pageHeight) + pageHeight) % pageHeight;
    return Math.min(intoPage, pageHeight - intoPage);
  })).toBeLessThan(2);
});

test('opens a resume-only print preview in a new tab', async ({ page, context }) => {
  await context.addInitScript(() => {
    window.print = () => undefined;
  });
  await createResumeFromTemplate(page);

  await page.getByRole('button', { name: 'Insert' }).click();
  await page.getByRole('menuitem', { name: 'Page break' }).click();
  await expect(page.locator('#resume .page-break-label')).toHaveText('Page Break');

  await page.getByRole('button', { name: 'File' }).click();
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('menuitem', { name: 'Print' }).click();
  const printPreview = await popupPromise;

  await expect(printPreview.locator('#resume')).toHaveCount(0);
  await expect(printPreview.locator('body')).toContainText('Randy Marsh');
  await expect(printPreview.locator('body > *').first()).toBeVisible();
  await expect(printPreview.locator('#app-header')).toHaveCount(0);
  await expect(printPreview.locator('#toolbar')).toHaveCount(0);
  await expect(printPreview.getByText('Page Break', { exact: true })).toHaveCount(0);
  await expect(printPreview.locator('.page-break')).toHaveCount(1);
  await expect(printPreview.locator('.page-break-editing')).toHaveCount(0);
  await expect(page.locator('#app-header')).toBeVisible();
});

test('routes the print keyboard shortcut to the resume-only tab', async ({ page, context }) => {
  await context.addInitScript(() => {
    window.print = () => undefined;
  });
  await createResumeFromTemplate(page);

  const popupPromise = page.waitForEvent('popup');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+P' : 'Control+P');
  const printPreview = await popupPromise;

  await expect(printPreview.locator('#resume')).toHaveCount(0);
  await expect(printPreview.locator('body')).toContainText('Randy Marsh');
  await expect(printPreview.locator('body > *').first()).toBeVisible();
  await expect(printPreview.locator('#app-header')).toHaveCount(0);
});

test('downloads HTML and font assets as a ZIP package', async ({ page }) => {
  await createResumeFromTemplate(page);

  await page.getByRole('button', { name: 'File' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: 'Export HTML/CSS package' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('resume.zip');
});

test('context menu has its base layout and surface styling', async ({ page }) => {
  await createResumeFromTemplate(page);

  await page.getByRole('heading', { name: 'Randy Marsh' }).click({ button: 'right' });

  const menu = page.locator('[data-popright-menu]');
  await expect(menu).toBeVisible();

  const menuStyle = await menu.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      position: style.position,
    };
  });
  const itemHeights = await menu.locator('[data-popright-item]').evaluateAll(
    (items) => items.map((item) => item.getBoundingClientRect().height),
  );

  expect(menuStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(menuStyle.position).toBe('fixed');
  expect(itemHeights.every((height) => height >= 24)).toBe(true);
});

test('keeps the selected-node menu visible across hover, editing, selection, and pane edges', async ({ page }) => {
  await createResumeFromTemplate(page);

  const entryTitle = page.locator('#resume').getByText('Tegridy Farms', { exact: true });
  await entryTitle.click();
  const entryMenu = page.getByRole('button', { name: 'More options for Entry' });
  await expect(entryMenu).toBeVisible();
  await expect(entryMenu).toHaveAttribute('aria-haspopup', 'menu');
  await expect(entryMenu).toHaveAttribute('aria-expanded', 'false');

  await page.getByRole('button', { name: 'Insert' }).hover();
  await expect(entryMenu).toBeVisible();
  await entryMenu.click();
  await expect(entryMenu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Entry', { exact: true })).toBeVisible();
  await entryMenu.click();
  await expect(entryMenu).toHaveAttribute('aria-expanded', 'false');

  await entryTitle.click();
  await expect(page.getByRole('button', { name: 'More options for Entry' })).toBeVisible();

  const sectionHeading = page.getByRole('heading', { name: 'Experience' });
  await sectionHeading.click();
  const sectionMenu = page.getByRole('button', { name: 'More options for Section' });
  await expect(sectionMenu).toBeVisible();
  await expect(page.getByRole('button', { name: 'More options for Entry' })).toHaveCount(0);

  await page.setViewportSize({ width: 600, height: 720 });
  const workspace = page.locator('.split-pane__workspace');
  await sectionHeading.evaluate((heading) => {
    const pane = heading.closest('.split-pane__workspace');
    if (!(pane instanceof HTMLElement)) throw new Error('Expected the editor workspace pane.');
    pane.scrollTop += heading.getBoundingClientRect().top - pane.getBoundingClientRect().top;
  });
  await expect(page.locator('.resume-hl-box-selected-node'))
    .toHaveAttribute('data-controls-placement', 'inside');

  const [menuBounds, workspaceBounds] = await Promise.all([
    sectionMenu.boundingBox(),
    workspace.boundingBox(),
  ]);
  expect(menuBounds).not.toBeNull();
  expect(workspaceBounds).not.toBeNull();
  expect(menuBounds!.x).toBeGreaterThanOrEqual(workspaceBounds!.x);
  expect(menuBounds!.x + menuBounds!.width)
    .toBeLessThanOrEqual(workspaceBounds!.x + workspaceBounds!.width);
  expect(menuBounds!.y).toBeGreaterThanOrEqual(workspaceBounds!.y);
  expect(menuBounds!.y + menuBounds!.height)
    .toBeLessThanOrEqual(workspaceBounds!.y + workspaceBounds!.height);
});

test('template preview does not inherit the active resume stylesheet', async ({ page }) => {
  await createResumeFromTemplate(page, 'Assured');

  await page.getByRole('button', { name: 'File' }).click();
  await page.getByRole('menuitem', { name: 'New', exact: true }).click();
  await page.getByText('Integrity', { exact: true }).click();

  const preview = page.getByRole('img', { name: 'Integrity template preview' });
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute('src', /integrity/i);
  await expect(page.locator('style[data-resume-editor-stylesheet]')).toHaveText('');
});

test('reviews and imports live DevTools changes across CSS sections', async ({ page }) => {
  await createResumeFromTemplate(page);
  await page.getByRole('tab', { name: 'CSS', exact: true }).click();

  const changedRules = await page.evaluate(() => {
    const style = document.querySelector<HTMLStyleElement>(
      'style[data-resume-editor-stylesheet]',
    );
    const rules = style?.sheet?.cssRules;
    if (!rules) return 0;

    let changed = 0;
    for (const rule of Array.from(rules)) {
      if ('selectorText' in rule && rule.selectorText === '#resume img') {
        (rule as CSSStyleRule).style.setProperty('max-width', '67%');
        changed += 1;
      }
      if ('selectorText' in rule && rule.selectorText === '#resume header') {
        (rule as CSSStyleRule).style.setProperty('padding-top', '13px');
        changed += 1;
      }
    }

    return changed;
  });

  expect(changedRules).toBe(2);
  const syncBanner = page.getByLabel('Live CSS changes detected');
  await expect(syncBanner).toContainText('2 live CSS changes detected');
  await syncBanner.getByRole('button', { name: 'Review and import' }).click();

  const modal = page.getByRole('dialog', { name: 'Import live CSS changes' });
  await expect(modal).toContainText('body img');
  await expect(modal).toContainText('67%');
  await expect(modal).toContainText('body header');
  await expect(modal).toContainText('13px');
  await expect(modal).not.toContainText('#resume');
  await modal.getByRole('button', { name: 'Import 2 changes' }).click();

  await expect(page.getByRole('status').filter({
    hasText: /^Imported 2 live CSS changes\.$/,
  })).toHaveText('Imported 2 live CSS changes.');
  await expect(syncBanner).not.toBeVisible();

  const imageHeading = page.locator('h2.css-title-heading').filter({
    has: page.locator('span.css-title', { hasText: /^Image$/ }),
  });
  await imageHeading.click();

  const imageSection = imageHeading.locator('..');
  const maxWidthRow = imageSection.locator('tr.property').filter({ hasText: 'max-width' });
  await expect(maxWidthRow.locator('.property-value')).toHaveText('67%');

  const headerHeading = page.locator('h2.css-title-heading').filter({
    has: page.locator('span.css-title', { hasText: /^Header$/ }),
  });
  await headerHeading.click();
  const headerSection = headerHeading.locator('..');
  const paddingTopRow = headerSection.locator('tr.property').filter({ hasText: 'padding-top' });
  await expect(paddingTopRow.locator('.property-value')).toHaveText('13px');

  const undo = page.getByRole('button', { name: 'Undo' });
  const redo = page.getByRole('button', { name: 'Redo' });
  await expect(undo).toBeEnabled();
  await undo.click();

  await expect(maxWidthRow.locator('.property-value')).toHaveText('100%');
  await expect(headerSection.locator('tr.property').filter({ hasText: 'padding-top' }))
    .toHaveCount(0);
  await expect(redo).toBeEnabled();

  await redo.click();
  await expect(maxWidthRow.locator('.property-value')).toHaveText('67%');
  await expect(headerSection.locator('tr.property').filter({ hasText: 'padding-top' })
    .locator('.property-value')).toHaveText('13px');
});
