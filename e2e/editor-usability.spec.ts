import { expect, test, type Page } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

async function isDirty(page: Page) {
  return page.evaluate(async path => (await import(path)).resumeDocumentDirtyState.getSnapshot(), '/src/shared/stores/resumeDocumentDirtyState.ts');
}

test('unchanged header focus and Escape stay clean; undo and redo follow the saved baseline', async ({ page }) => {
  await createResumeFromTemplate(page);
  const name = page.getByRole('heading', { name: 'Randy Marsh' });
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await name.dblclick();
  await page.getByRole('textbox', { name: 'Subtitle', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('textbox', { name: 'Subtitle', exact: true })).toHaveCount(0);
  expect(await isDirty(page)).toBe(false);
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await name.dblclick();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Jordan Sample');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  expect(await isDirty(page)).toBe(true);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(name).toBeVisible();
  expect(await isDirty(page)).toBe(false);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Jordan Sample' })).toBeVisible();
  expect(await isDirty(page)).toBe(true);
});

test('selected content has a labeled edit action and Escape retires one menu layer', async ({ page }) => {
  await createResumeFromTemplate(page);
  const text = page.locator('#resume .text-content').first();
  const bounds = await text.boundingBox();
  await text.hover();
  await expect(text).toHaveCSS('outline-style', 'dashed');
  await expect(text.locator('xpath=ancestor::*[@data-resume-interactive][1]')).toHaveCSS('outline-style', 'none');
  expect(await text.boundingBox()).toEqual(bounds);
  await text.click();
  await page.getByRole('button', { name: 'Edit content', exact: true }).click();
  await expect(page.getByLabel('Text content')).toBeVisible();
  await page.getByRole('button', { name: /Cancel/ }).click();
  const trigger = page.getByRole('button', { name: 'More options for Text' });
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-popright-menu]')).toHaveCount(0);
  await expect(trigger).toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveCount(0);
});

test('inserting an offscreen section reveals its selected tree row and focused title', async ({ page }) => {
  await createResumeFromTemplate(page);
  await page.setViewportSize({ width: 1363, height: 600 });
  const count = await page.locator('#resume section').count();
  await page.getByRole('button', { name: 'Insert', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Section', exact: true }).click();
  const title = page.getByRole('textbox', { name: 'Section title' });
  await expect(title).toBeFocused();
  await expect(title).toBeInViewport();
  await expect(page.getByRole('treeitem', { name: 'Section (empty)', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('treeitem', { name: 'Section (empty)', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('#resume section')).toHaveCount(count);
  // A second insertion can be named without finding the end of the document manually.
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Insert', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Section', exact: true }).click();
  await title.fill('Publications');
  await title.press('Enter');
  await expect(page.getByRole('treeitem', { name: 'Section: Publications', exact: true })).toHaveAttribute('aria-selected', 'true');
});

test('section title draft survives selecting the same input again', async ({ page }) => {
  await createResumeFromTemplate(page);
  const heading = page.getByRole('heading', { name: 'Contact', exact: true });
  await heading.getByText('Contact', { exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Section title', exact: true });
  await input.fill('Uncommitted draft');
  await input.click();
  await expect(input).toHaveValue('Uncommitted draft');
  await input.press('Enter');
  await expect(page.getByRole('heading', { name: 'Uncommitted draft', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(heading).toBeVisible();
});

test('horizontal header editing preserves contact group geometry and excludes completion chrome from print', async ({ page, context }) => {
  await context.addInitScript(() => { window.print = () => undefined; });
  await page.setViewportSize({ width: 1363, height: 936 });
  await createResumeFromTemplate(page, 'Assured');
  const header = page.locator('#resume header').first();
  const geometry = () => header.evaluate(element => ({
    height: element.getBoundingClientRect().height,
    children: Array.from(element.children).slice(1).map(child => child.getBoundingClientRect().width)
  }));
  const before = await geometry();
  await header.locator('h1').dblclick();
  await expect(page.getByRole('toolbar', { name: 'Header editing' })).toBeVisible();
  await expect(header.locator('.header-edit-actions')).toHaveCount(0);
  const after = await geometry();
  expect(after.height).toBeLessThanOrEqual(before.height + 12);
  expect(after.children).toHaveLength(before.children.length);
  after.children.forEach((width, index) => expect(width).toBeGreaterThanOrEqual(before.children[index] - 2));
  await page.getByRole('button', { name: 'File', exact: true }).click();
  const popup = page.waitForEvent('popup');
  await page.getByRole('menuitem', { name: 'Print / Save as PDF' }).click();
  const printed = await popup;
  await expect(printed.locator('body')).toContainText('Solid Programmer');
  await expect(printed.locator('.header-edit-actions')).toHaveCount(0);
  await expect(printed.getByRole('button', { name: 'Done', exact: true })).toHaveCount(0);
});

for (const theme of ['light', 'dark']) {
test(`CSS compact actions have readable hover and focus help in ${theme}`, async ({ page }) => {
  await createResumeFromTemplate(page);
  await page.locator('html').evaluate((element, selectedTheme) => element.setAttribute('data-theme', selectedTheme), theme);
  await page.getByRole('tab', { name: 'CSS', exact: true }).click();
  for (const name of ['Add nested rule to Resume CSS', 'Highlight elements matching body', 'Add pseudo-class or pseudo-element to Resume CSS']) {
    const action = page.getByRole('button', { name, exact: true });
    await expect(action).toHaveAttribute('title', name);
    await action.focus();
    await expect(action.locator('..').getByRole('tooltip')).toHaveText(name);
    await expect(action.locator('..').getByRole('tooltip')).toHaveCSS('letter-spacing', 'normal');
    await expect(action.locator('..').getByRole('tooltip')).toHaveCSS('word-spacing', '0px');
    await page.locator('#resume').hover();
    await action.hover();
    await expect(action.locator('..').getByRole('tooltip')).toBeVisible();
  }
  const add = page.getByRole('button', { name: 'Add nested rule to Resume CSS', exact: true });
  await add.focus();
  const prose = await add.locator('..').getByRole('tooltip').evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = getComputedStyle(element).font;
    return { width: range.getBoundingClientRect().width, expected: context.measureText(element.textContent!).width };
  });
  // A one-line explanation must retain normal glyph advances rather than button-group compression.
  expect(prose.width).toBeGreaterThanOrEqual(prose.expected - 2);
  expect(prose.width).toBeLessThanOrEqual(prose.expected + 2);
  await add.press('Enter');
  await expect(page.getByRole('button', { name: /^Delete Resume CSS Ruleset/ })).toBeVisible();
  const nestedAction = page.getByRole('button', { name: /^Add nested rule to Resume CSS Ruleset/ });
  await nestedAction.focus();
  const nestedTooltip = nestedAction.locator('..').getByRole('tooltip');
  await expect(nestedTooltip).toBeVisible();
  const contrast = await nestedTooltip.evaluate(element => {
    const rgb = (value: string) => value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const luminance = (values: number[]) => values.map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const style = getComputedStyle(element);
    const foreground = luminance(rgb(style.color));
    const background = luminance(rgb(style.backgroundColor));
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});
}

for (const theme of ['light', 'dark']) {
  test(`inspector tabs stay on one row and toolbar captions meet contrast in ${theme}`, async ({ page }) => {
    await createResumeFromTemplate(page);
    await page.setViewportSize({ width: 1363, height: 936 });
    await page.locator('html').evaluate((element, selectedTheme) => element.setAttribute('data-theme', selectedTheme), theme);
    const tabs = page.getByRole('tab');
    const topPositions = await tabs.evaluateAll(elements => elements.map(element => Math.round(element.getBoundingClientRect().top)));
    expect(new Set(topPositions).size).toBe(1);
    const first = tabs.first();
    await first.focus();
    await first.press('End');
    await expect(tabs.last()).toBeFocused();
    await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
    const contrast = await page.locator('.toolbar-label').first().evaluate(element => {
      const rgb = (value: string) => value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const luminance = (values: number[]) => values.map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const foreground = luminance(rgb(getComputedStyle(element).color));
      const background = luminance(rgb(getComputedStyle(document.getElementById('toolbar')!).backgroundColor));
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
}
