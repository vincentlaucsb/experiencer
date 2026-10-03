import { expect, test, type Page } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

const LONG_WORD = 'X'.repeat(180);
const LONG_BULLET = 'Delivered a resilient platform migration across several regional teams '
  + 'while preserving uptime, consolidating legacy reporting pipelines, and improving the '
  + 'accuracy of quarterly forecasts for finance stakeholders in every operating region we served.';
const SIDEBAR_EMAIL = 'maya.patel@mail.example';
const LETTER_WIDTH = 8.5 * 96;
const INTEGRITY_SIDEBAR_WIDTH = 250;

interface ColumnMetrics {
  columnWidth: number;
  columnContentRight: number;
  bulletRight: number;
  bulletLines: number;
  emailLines: number;
}

/** Measures rendered text lines, not boxes, so glyphs escaping a box are still counted. */
async function measureColumns(page: Page, root: string): Promise<ColumnMetrics> {
  return page.evaluate(({ root, longBullet, email }) => {
    const lines = (element: Element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return Array.from(range.getClientRects());
    };
    const host = document.querySelector<HTMLElement>(root)!;
    const column = host.querySelector<HTMLElement>('#main-column')!;
    const bounds = column.getBoundingClientRect();
    const bullet = Array.from(host.querySelectorAll('#experience li'))
      .find((item) => item.textContent === longBullet)!;
    const emailParagraph = Array.from(host.querySelectorAll('#sidebar p'))
      .find((item) => item.textContent === email)!;
    const bulletLines = lines(bullet);
    return {
      columnWidth: bounds.width,
      columnContentRight: bounds.right - parseFloat(getComputedStyle(column).paddingRight),
      bulletRight: Math.max(...bulletLines.map((line) => line.right)),
      bulletLines: new Set(bulletLines.map((line) => Math.round(line.top))).size,
      emailLines: new Set(lines(emailParagraph).map((line) => Math.round(line.top))).size
    };
  }, { root, longBullet: LONG_BULLET, email: SIDEBAR_EMAIL });
}

/**
 * An unbreakable token may overflow its own column, but it must not widen the column's grid
 * track: ordinary text beside it wraps within the track, and ordinary sidebar tokens stay whole.
 */
function expectColumnContract(metrics: ColumnMetrics) {
  const details = JSON.stringify(metrics);
  expect(metrics.columnWidth, details).toBeLessThanOrEqual(LETTER_WIDTH - INTEGRITY_SIDEBAR_WIDTH + 1);
  expect(metrics.bulletRight, details).toBeLessThanOrEqual(metrics.columnContentRight + 1);
  expect(metrics.bulletLines, details).toBeGreaterThan(2);
  expect(metrics.emailLines, details).toBe(1);
}

async function replaceMarkdown(page: Page, selector: string, value: string, expectedText: string) {
  const markdown = page.locator(selector).first();
  await markdown.click();
  await markdown.click();
  await expect(page.locator('.w-md-editor')).toBeVisible();
  await page.getByLabel('Text content').fill(value);
  await page.getByRole('button', { name: 'Save (Ctrl + Enter)' }).click();
  await expect(page.locator('.w-md-editor')).toHaveCount(0);
  await expect(markdown).toContainText(expectedText);
}

test('keeps Integrity\'s main column at its track width beside an unbreakable word in the editor and print output', async ({ page, context }) => {
  await context.addInitScript(() => {
    window.print = () => undefined;
  });
  await createResumeFromTemplate(page, 'Integrity');

  await replaceMarkdown(
    page,
    '#resume #experience .entry .text-content',
    `- Short bullet\n- ${LONG_WORD}\n- ${LONG_BULLET}`,
    LONG_WORD
  );
  await replaceMarkdown(
    page,
    '#resume #sidebar .text-content',
    `South Park, CO\n\n${SIDEBAR_EMAIL}`,
    SIDEBAR_EMAIL
  );

  expectColumnContract(await measureColumns(page, '#resume'));

  await page.getByRole('button', { name: 'File' }).click();
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('menuitem', { name: 'Print' }).click();
  const printPreview = await popupPromise;
  await expect(printPreview.locator('body')).toContainText(LONG_BULLET);
  await printPreview.emulateMedia({ media: 'print' });
  await printPreview.setViewportSize({ width: LETTER_WIDTH, height: 11 * 96 });

  // Print clips at the page edge, so the ordinary bullet must end inside the printable column.
  const printed = await measureColumns(printPreview, 'body');
  expectColumnContract(printed);
  expect(printed.bulletRight).toBeLessThanOrEqual(LETTER_WIDTH);
});
