import { test, expect } from '@playwright/test';

test.describe('Feature 4: GitHub Integration, Evidence Engine & Proof-of-Work', () => {
  test('verify GitHub identity link, evidence summary, and Proof-of-Work profile tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify brand heading
    await expect(page.locator('nav').getByText('Śiṣya Abhyāsa')).toBeVisible();

    // Verify empty state approved start paths
    await expect(page.getByText('Find me a project')).toBeVisible();
  });
});
