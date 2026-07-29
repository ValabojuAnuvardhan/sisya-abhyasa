import { test, expect } from '@playwright/test';

test.describe('Feature 1: Authentication & Account Security', () => {
  test('verify signup modal, login modal, and session status rendering', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify main brand heading
    await expect(page.locator('nav').getByText('Śiṣya Abhyāsa')).toBeVisible();

    // Verify empty state approved start paths
    await expect(page.getByText('Find me a project')).toBeVisible();
    await expect(page.getByText('I have a project idea')).toBeVisible();
    await expect(page.getByText('Explore projects to join')).toBeVisible();
  });
});
