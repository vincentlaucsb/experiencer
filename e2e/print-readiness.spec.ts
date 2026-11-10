import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

for (const pausedSurface of ['measurement frame', 'print tab']) {
  test(`opens print options without animation frames in the ${pausedSurface}`, async ({ page, context }) => {
    await createResumeFromTemplate(page);
    // Model browser visibility throttling at the browser API boundary. Headless
    // Chromium otherwise keeps delivering frames and hides this regression.
    await context.addInitScript((surface) => {
      const isFrame = window !== window.top;
      if (isFrame === (surface === 'measurement frame')) {
        window.requestAnimationFrame = () => 0;
      }
      window.print = () => { document.body.dataset.printInvoked = 'true'; };
    }, pausedSurface);

    await page.getByRole('button', { name: 'File', exact: true }).click();
    const opened = page.waitForEvent('popup');
    await page.getByRole('menuitem', { name: 'Print' }).click();
    const preview = await opened;

    // Never switch back to the editor or dispatch visibility/focus events.
    await expect(preview.locator('body')).toHaveAttribute('data-print-invoked', 'true', { timeout: 5_000 });
    await expect(preview.locator('body')).toContainText('Randy Marsh');
    await expect(preview.locator('#toolbar')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });
}
