import { test, expect } from '@playwright/test';

/**
 * Browser-based test configuration
 * Run with: npx playwright test --ui
 * 
 * This file provides browser-level interaction tests
 * that allow manual browser control during testing.
 */

test.describe('Browser UI Controls', () => {
  test('can navigate to login page', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator('h1:has-text("Sign in")')).toBeVisible();
    // Manual: Inspect network calls, check DOM structure
  });

  test('can interact with register form', async ({ page }) => {
    await page.goto('/register');
    
    // Manual: Test form validation
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Manual: Test password strength indicator
    await page.fill('input[name="password"]', 'test123');
    await expect(page.locator('text:has("Password")')).toBeVisible();
  });

  test('can access dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Manual: Check navigation menu
    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('a:has-text("Groups")')).toBeVisible();
    await expect(page.locator('a:has-text("Personal")')).toBeVisible();
  });

  test('can interact with group creation', async ({ page }) => {
    await page.goto('/groups');
    
    // Manual: Test group form
    const groupName = page.locator('input[name="groupName"]');
    await expect(groupName).toBeVisible();
    
    // Manual: Verify auto-generated group icons
    await expect(page.locator('.group-icon')).toBeVisible();
  });

  test('can access profile settings', async ({ page }) => {
    await page.goto('/profile');
    
    // Manual: Check profile form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
  });

  test('can view expense breakdown', async ({ page }) => {
    await page.goto('/personal');
    
    // Manual: Check category cards
    const categories = ['Food', 'Transport', 'Rent', 'Shopping', 'Entertainment'];
    for (const category of categories) {
      await expect(page.locator(`text:has("${category}")`)).toBeVisible();
    }
  });

  test('can navigate via bottom nav (mobile)', async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    
    // Manual: Test bottom navigation
    await expect(page.locator('nav.bottom-nav')).toBeVisible();
    await expect(page.locator('button:has-text("Home")')).toBeVisible();
  });
});

test.describe('Browser Inspect Tools', () => {
  test('can inspect network requests', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Manual: Open DevTools Network tab
    // Filter by API calls, check headers, response bodies
    
    // Manual: Check localStorage items
    // localStorage.getItem('rokka_groups')
    // localStorage.getItem('rokka_transactions')
  });

  test('can check performance metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Manual: Open DevTools Performance tab
    // Monitor: First Contentful Paint (FCP), Time to Interactive (TTI)
    
    // Manual: Check Network waterfall
    // Look for: Largest Contentful Paint (LCP), Total Blocking Time (TBT)
  });

  test('can test accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Manual: Run axe-core in DevTools
    // Check for: ARIA labels, contrast ratios, keyboard navigation
    
    // Manual: Test with screen readers
    // NVDA, JAWS, VoiceOver compatibility
  });

  test('can debug component rendering', async ({ page }) => {
    await page.goto('/groups');
    
    // Manual: React DevTools - inspect component tree
    // Virtual DOM diff, state inspection
    
    // Manual: Tailwind class inspection
    // Check custom utility classes, glassmorphic effects
  });
});
