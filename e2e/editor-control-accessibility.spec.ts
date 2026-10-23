import { expect, test, type Page } from '@playwright/test';

async function createAssured(page: Page) {
  // Each Playwright context starts empty; avoid a reload-clearing init script so
  // these journeys can verify the real browser persistence boundary.
  await page.goto('/');
  await page.getByRole('button', { name: 'New' }).click();
  await page.getByText('Assured', { exact: true }).click();
  await page.getByRole('button', { name: 'Use this Template' }).click();
  await expect(page.locator('#resume')).toBeVisible();
  await expect(page.locator('.save-status')).toContainText('Saved v1');
}

for (const viewportWidth of [1280, 900]) {
test(`first-selection guidance leaves inspector navigation usable at ${viewportWidth}px and stays dismissed`, async ({ page }) => {
  await page.setViewportSize({ width: viewportWidth, height: 720 });
  await createAssured(page);
  await expect(page.locator('.resume-selection-hint')).toHaveCount(0);
  const initialResumeTop = (await page.locator('#resume').boundingBox())!.y;
  await page.locator('#resume h1').click();
  await expect.poll(async () => (await page.locator('#resume').boundingBox())!.y).toBe(initialResumeTop);
  const hint = page.getByRole('note');
  await expect(hint).toContainText('node menu');
  await expect(page.locator('.split-pane__inspector').getByRole('note')).toBeVisible();

  for (const name of ['CSS', 'Tree']) {
    await page.getByRole('tab', { name, exact: true }).click();
    await expect(page.getByRole('tab', { name, exact: true }))
      .toHaveAttribute('aria-selected', 'true');
  }

  await page.getByRole('button', { name: 'Dismiss node options tip' }).click();
  await expect(hint).toHaveCount(0);
  await expect.poll(async () => (await page.locator('#resume').boundingBox())!.y).toBe(initialResumeTop);
  await expect.poll(async () => {
    const header = await page.locator('#resume header').boundingBox();
    const outline = await page.locator('.resume-hl-box-selected-node').boundingBox();
    return header && outline ? Math.abs(header.y - outline.y) : Infinity;
  }).toBeLessThan(1);
  await page.reload();
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await page.locator('#resume h1').click();
  await expect(hint).toHaveCount(0);
});
}

test('direct header double-click still enters editing before the first tip is dismissed', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await createAssured(page);
  const initialResumeTop = (await page.locator('#resume').boundingBox())!.y;
  await page.locator('#resume h1').dblclick();
  await expect(page.getByRole('textbox', { name: 'Title', exact: true })).toBeFocused();
  await expect(page.locator('.resume-selection-hint')).toHaveCount(0);
  await expect.poll(async () => (await page.locator('#resume').boundingBox())!.y).toBe(initialResumeTop);
  await expect(page.getByRole('button', { name: /Save/ }).first()).toBeVisible();
});

test('node menu stays open and aligned when opening it dismisses selection guidance', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await createAssured(page);
  await page.locator('#resume h1').click();
  await expect(page.getByRole('note')).toBeVisible();
  const trigger = page.getByRole('button', { name: 'More options for Header', exact: true });
  await trigger.click();
  await expect(page.getByRole('note')).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('menuitem', { name: 'Edit', exact: true })).toBeVisible();
  await expect.poll(async () => {
    const header = await page.locator('#resume header').boundingBox();
    const outline = await page.locator('.resume-hl-box-selected-node').boundingBox();
    return header && outline ? Math.abs(header.y - outline.y) : Infinity;
  }).toBeLessThan(1);
});

test('paper-size pressed state follows the saved document size', async ({ page }) => {
  await createAssured(page);
  const letter = page.getByRole('button', { name: 'Letter', exact: true });
  const a4 = page.getByRole('button', { name: 'A4', exact: true });
  await expect(letter).toHaveAttribute('aria-pressed', 'true');
  await expect(a4).toHaveAttribute('aria-pressed', 'false');
  await a4.click();
  await expect(page.locator('#resume')).toHaveAttribute('data-page-size', 'a4');
  await expect(a4).toHaveAttribute('aria-pressed', 'true');
  await expect(letter).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Control+s');
  await expect(page.locator('.save-status')).toContainText('Saved v2');
  await page.reload();
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('#resume')).toHaveAttribute('data-page-size', 'a4');
  await expect(a4).toHaveAttribute('aria-pressed', 'true');
  await expect(letter).toHaveAttribute('aria-pressed', 'false');
});

test('File expanded state follows native menu lifecycle and preserves keyboard focus', async ({ page }) => {
  await createAssured(page);
  const file = page.getByRole('button', { name: 'File', exact: true });
  const newItem = page.getByRole('menuitem', { name: 'New', exact: true });
  await expect(file).toHaveAttribute('aria-expanded', 'false');
  await file.click();
  await expect(newItem).toBeVisible();
  await expect(file).toHaveAttribute('aria-expanded', 'true');
  await file.click();
  await expect(newItem).toHaveCount(0);
  await expect(file).toHaveAttribute('aria-expanded', 'false');

  await file.click();
  await page.keyboard.press('Escape');
  await expect(newItem).toHaveCount(0);
  await expect(file).toHaveAttribute('aria-expanded', 'false');
  await expect(file).toBeFocused();

  await file.click();
  await page.locator('#resume h1').click();
  await expect(newItem).toHaveCount(0);
  await expect(file).toHaveAttribute('aria-expanded', 'false');

  await file.click();
  await page.getByRole('menuitem', { name: 'Save Ctrl + S', exact: true }).click();
  await expect(newItem).toHaveCount(0);
  await expect(page.locator('#resume')).toBeVisible();
  await expect(file).toHaveAttribute('aria-expanded', 'false');
});
