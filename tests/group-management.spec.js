import { test, expect } from '@playwright/test';

// Group creation and management tests
test.describe('Group Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should create a new group', async ({ page }) => {
    await page.goto('/groups');
    const groupName = 'Dinner Party';
    await page.fill('input[name="groupName"]', groupName);
    await page.click('button:has-text("Create")');
    
    // Verify group was created
    await expect(page.locator(`text="${groupName}"`).first()).toBeVisible();
  });

  test('should add members to a group', async ({ page }) => {
    const group = 'Dinner Party';
    await page.goto('/groups');
    await page.click(`text="${group}"`);
    
    // Add a member
    await page.fill('input[name="memberName"]', 'Alice');
    await page.click('button:has-text("Add")');
    
    // Verify member was added
    await expect(page.locator('text=Alice')).toBeVisible();
  });

  test('should add an expense to a group', async ({ page }) => {
    const group = 'Dinner Party';
    await page.goto('/groups');
    await page.click(`text="${group}"`);
    
    await page.fill('input[name="expenseTitle"]', 'Pizza');
    await page.fill('input[name="expenseAmount"]', '50');
    await page.click('button:has-text("Add Expense")');
    
    // Verify expense was added
    await expect(page.locator('text=Pizza')).toBeVisible();
  });

  test('should settle debts in a group', async ({ page }) => {
    const group = 'Dinner Party';
    await page.goto('/groups');
    await page.click(`text="${group}"`);
    
    // Settle up button should be visible
    await expect(page.locator('text:Settle Up')).toBeVisible();
    
    await page.click('text:Settle Up');
    await expect(page.locator('text:Settled')).toBeVisible();
  });

  test('should delete a group', async ({ page }) => {
    const group = 'Dinner Party';
    await page.goto('/groups');
    await page.click(`text="${group}"`);
    
    await page.click('button:has-text("Delete")');
    await expect(page.locator('text=Group deleted')).toBeVisible();
  });
});
