import { test, expect } from '@playwright/test';

test.describe('Feature 2: Community Discovery & Transparent Match Explanation', () => {
  test('verify community marketplace project cards and AI match explanation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Projects tab
    await page.click('button:has-text("Projects")');
    await expect(page.getByText('Community Projects')).toBeVisible();

    // Verify V2 categories excluded
    await expect(page.getByRole('button', { name: 'Academic' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Company' })).toHaveCount(0);
  });
});
