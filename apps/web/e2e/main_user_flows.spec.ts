import { test, expect } from '@playwright/test';

test.describe('Localhost Full-Stack Software Testing Suite — Śiṣya Abhyāsa', () => {

  test('Flow 1: Landing Page & Public Navigation Header', async ({ page }) => {
    await page.goto('/');

    // Verify main brand title
    await expect(page.getByText('Śiṣya Abhyāsa').first()).toBeVisible();

    // Verify public navigation links
    await expect(page.getByRole('link', { name: /Discover/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Community/i }).first()).toBeVisible();
  });

  test('Flow 2: GitHub Evidence Workspace (/github)', async ({ page }) => {
    await page.goto('/github');

    // Verify module title
    await expect(page.getByRole('heading', { name: 'GitHub Evidence' })).toBeVisible();
    await expect(page.getByText('Track your contributions, pull requests, and build your verified project experience.')).toBeVisible();

    // Verify GitHub Connection Status Card (Connected or Not Connected)
    await expect(page.getByText(/GitHub Connected|GitHub Not Connected/i)).toBeVisible();

    // Verify Evidence Stream Tabs
    await expect(page.getByRole('button', { name: 'Evidence Timeline' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pull Requests' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Commits' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Branches' })).toBeVisible();

    // Test tab switching interactivity
    await page.getByRole('button', { name: 'Pull Requests' }).click();
    await page.getByRole('button', { name: 'Commits' }).click();
    await page.getByRole('button', { name: 'Evidence Timeline' }).click();

    // Verify AI Employability Audit Card
    await expect(page.getByRole('heading', { name: 'AI Verification & Employability Audit' })).toBeVisible();
    await expect(page.getByText('Production Ready')).toBeVisible();
  });

  test('Flow 3: Proof-of-Work Portfolio Page (/proof)', async ({ page }) => {
    await page.goto('/proof');

    // Verify page container loaded
    await page.waitForLoadState('domcontentloaded');

    // Check that proof container or error/auth banner renders
    await expect(page.locator('main')).toBeVisible();
  });

  test('Flow 4: Projects Discovery View (/projects)', async ({ page }) => {
    await page.goto('/projects');

    // Verify projects page title
    await expect(page.locator('main')).toBeVisible();
  });

});
