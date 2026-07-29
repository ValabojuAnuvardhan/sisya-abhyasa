import { test, expect } from '@playwright/test';

test.describe('Feature 3: Join Workflow, Team Space & AI Mentor', () => {
  test('verify project join request, owner acceptance, and Team Space chat', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Discover tab
    await page.click('button:has-text("Discover")');
    await expect(page.getByText('Find a Project Idea')).toBeVisible();

    // Select first problem card
    await page.locator('.prob-card').first().click();
    await expect(page.getByText('Prototype Project Plan')).toBeVisible();
  });
});
