import { test, expect } from '@playwright/test';

test.describe('Login & Authentication Testing Suite — local-software-tester skill', () => {

  test('Test Case 1: Invalid Login Displays Clear Error Message', async ({ page }) => {
    await page.goto('/auth');

    // Verify Auth Page is rendered
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    // Fill in invalid email & password credentials
    await page.getByPlaceholder('student@example.com').fill('nonexistent_student_99@example.com');
    await page.getByPlaceholder('At least 10 characters').fill('WrongPassword123!');

    // Click "Sign in" submit button
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Assert error banner is displayed with clear error message
    const errorBanner = page.locator('.error-banner');
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    await expect(errorBanner).toContainText('Invalid email or password');
  });

  test('Test Case 2: Full Registration, Verification & Successful Login Flow', async ({ page }) => {
    await page.goto('/auth');

    const timestamp = Date.now();
    const testEmail = `test_student_${timestamp}@example.com`;
    const testPassword = 'Password123!Secure';
    const testName = 'Test Student User';

    // Step A: Switch to Signup Mode
    await page.getByRole('button', { name: 'Create a new account' }).click();
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

    // Step B: Fill out Signup Form
    await page.getByPlaceholder('e.g. Anuvardhan').fill(testName);
    await page.getByPlaceholder('student@example.com').fill(testEmail);
    await page.getByPlaceholder('At least 10 characters').fill(testPassword);

    // Submit Signup Form
    await page.getByRole('button', { name: 'Create account', exact: true }).click();

    // Verify email verification prompt appears in dev mode
    await expect(page.getByText('Account created')).toBeVisible({ timeout: 5000 });

    // Step C: Trigger Development Auto-Verify Button
    const verifyBtn = page.getByRole('button', { name: /Auto-Verify Email/i });
    if (await verifyBtn.isVisible()) {
      await verifyBtn.click();
      await expect(page.getByText('Email verified successfully')).toBeVisible({ timeout: 5000 });
    }

    // Step D: Perform Successful Login
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await page.getByPlaceholder('student@example.com').fill(testEmail);
    await page.getByPlaceholder('At least 10 characters').fill(testPassword);

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Step E: Verify Successful Authentication & Redirect
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/(onboarding|dashboard)/);
  });

});
