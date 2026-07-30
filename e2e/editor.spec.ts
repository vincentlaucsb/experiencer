import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('switches page size and adds a new section', async ({ page }) => {
  await createResumeFromTemplate(page);

  await expect(page.locator('#resume')).toHaveAttribute('data-page-size', 'letter');
  await page.getByRole('button', { name: 'A4' }).click();
  await expect(page.locator('#resume')).toHaveAttribute('data-page-size', 'a4');

  const sectionCount = await page.locator('#resume section').count();
  await page.getByRole('button', { name: 'Add Section' }).click();

  await expect(page.locator('#resume section')).toHaveCount(sectionCount + 1);
  await expect(page.getByRole('heading', { name: 'Enter a title' })).toBeVisible();
});

test('opens and exits print preview from the file menu', async ({ page }) => {
  await createResumeFromTemplate(page);

  await page.getByRole('button', { name: 'File' }).click();
  await page.getByRole('button', { name: 'Print' }).click();

  await expect(page.locator('#print-preview-actions')).toBeVisible();
  await expect(page.locator('#app-header')).toBeHidden();

  await page.getByRole('button', { name: 'Exit Print Preview' }).click();

  await expect(page.locator('#app-header')).toBeVisible();
  await expect(page.locator('#toolbar')).toBeVisible();
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

test('template preview does not inherit the active resume stylesheet', async ({ page }) => {
  await createResumeFromTemplate(page, 'Assured');

  await page.getByRole('button', { name: 'File' }).click();
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await page.getByText('Integrity', { exact: true }).click();

  const preview = page.getByLabel('Integrity template preview');
  await expect(preview).toBeVisible();
  await expect(page.locator('style[data-resume-editor-stylesheet]')).toHaveText('');

  const previewHeaderColor = await preview.locator('header').first().evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  expect(previewHeaderColor).not.toBe('rgb(232, 232, 232)');
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
  await expect(modal).toContainText('#resume img');
  await expect(modal).toContainText('67%');
  await expect(modal).toContainText('#resume header');
  await expect(modal).toContainText('13px');
  await modal.getByRole('button', { name: 'Import 2 changes' }).click();

  await expect(page.getByRole('status')).toHaveText('Imported 2 live CSS changes.');
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
});
