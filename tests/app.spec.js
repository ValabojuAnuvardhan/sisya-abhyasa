import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Śiṣya Abhyāsa V1.1 frontend baseline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('V1.1 navigation has no internship-first flow or scoring', async ({ page }) => {
    await expect(page.locator('nav').getByText('Śiṣya Abhyāsa')).toBeVisible();
    await expect(page.getByText('Internships', { exact: true })).toHaveCount(0);
    await expect(page.getByText('BuildScore', { exact: false })).toHaveCount(0);
    await expect(page.getByText('Peer Score', { exact: false })).toHaveCount(0);
  });

  test('empty-state entry exposes three approved start paths', async ({ page }) => {
    await expect(page.getByText('Find me a project')).toBeVisible();
    await expect(page.getByText('I have a project idea')).toBeVisible();
    await expect(page.getByText('Explore projects to join')).toBeVisible();
  });

  test('project discovery opens a prototype plan without browser AI credentials', async ({ page }) => {
    await page.click('button:has-text("Discover")');
    await expect(page.getByText('Find a Project Idea')).toBeVisible();
    await page.locator('.prob-card').first().click();
    await expect(page.getByText('Prototype Project Plan')).toBeVisible();
  });

  test('community discovery excludes V2 source categories from the UI', async ({ page }) => {
    await page.click('button:has-text("Projects")');
    await expect(page.getByText('Community Projects')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Academic' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Company' })).toHaveCount(0);
  });
});
