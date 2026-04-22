import { test, expect } from '@playwright/test';

// Personal transaction tests
test.describe('Personal Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should add a personal expense', async ({ page }) => {
    await page.goto('/personal');
    await page.fill('input[name="amount"]', '100');
    await page.fill('input[name="category"]', 'food');
    await page.fill('input[name="description"]', 'Groceries');
    await page.click('button:has-text("Add")');
    
    // Verify transaction was added
    await expect(page.locator('text=Groceries')).toBeVisible();
  });

  test('should add income', async ({ page }) => {
    await page.goto('/personal');
    await page.check('input[type="radio"]:has-text("Income")');
    await page.fill('input[name="amount"]', '2000');
    await page.fill('input[name="category"]', 'salary');
    await page.fill('input[name="description"]', 'Monthly Salary');
    await page.click('button:has-text("Add")');
    
    // Verify income was added
    await expect(page.locator('text=Monthly Salary')).toBeVisible();
  });

  test('should show category breakdown', async ({ page }) => {
    await page.goto('/personal');
    
    // Categories should be displayed
    await expect(page.locator('text:has("Food")')).toBeVisible();
    await expect(page.locator('text:has("Transport")')).toBeVisible();
    await expect(page.locator('text:has("Rent")')).toBeVisible();
  });

  test('should delete a transaction', async ({ page }) => {
    // Add a transaction first
    await page.goto('/personal');
    await page.fill('input[name="amount"]', '50');
    await page.fill('input[name="category"]', 'shopping');
    await page.fill('input[name="description"]', 'Test Item');
    await page.click('button:has-text("Add")');
    
    // Delete the transaction
    await page.click('button:has-text("Delete")');
    await expect(page.locator('text=Test Item')).not.toBeVisible();
  });
});
