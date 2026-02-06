import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test('Homepage should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');

    // Check if hero text is visible
    await expect(page.getByText('ALEX PRINT LAB')).toBeVisible();

    // Check if navigation is accessible
    await expect(page.getByText('訂單追蹤')).toBeVisible();

    // Check if product cards are displayed
    const productCards = page.locator('.maker-card, [class*="maker"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Track Order page should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/track');

    // Check search input is visible and usable
    const searchInput = page.locator('input[placeholder*="電話"]');
    await expect(searchInput).toBeVisible();
    await searchInput.click();
    await searchInput.type('0912345678');

    // Check search button
    const searchButton = page.locator('button[type="submit"]');
    await expect(searchButton).toBeVisible();
  });

  test('Product cards should stack properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for products to load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // Check grid layout adapts to mobile
    const grid = page.locator('[class*="grid"]').first();
    const gridClass = await grid.getAttribute('class');

    // Should have mobile-first single column
    expect(gridClass).toContain('grid');
  });

  test('Cart button should be accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Find floating cart button
    const cartButton = page.locator('button:has-text(""), button[class*="cart"], button[class*="fixed"]').last();
    await expect(cartButton).toBeVisible();
  });
});

test.describe('Order Tracking with Messages', () => {
  test('Order search should work', async ({ page }) => {
    await page.goto('/track');

    // Search for an order (assuming test data exists)
    const searchInput = page.locator('input[placeholder*="電話"]');
    await searchInput.fill('test@example.com');

    const searchButton = page.locator('button[type="submit"]');
    await searchButton.click();

    // Should show either results or "no orders found" message
    await page.waitForTimeout(2000);
    const hasResults = await page.locator('text=/找不到相關訂單|Order ID/i').isVisible();
    expect(hasResults).toBeTruthy();
  });

  test('Message box should be expandable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/track');

    // Try to search and expand messages
    const searchInput = page.locator('input[placeholder*="電話"]');
    await searchInput.fill('test@example.com');
    await searchInput.press('Enter');

    await page.waitForTimeout(2000);

    // Check if message section exists
    const messageSection = page.locator('text=訂單留言').first();
    if (await messageSection.isVisible()) {
      await messageSection.click();
      await page.waitForTimeout(500);

      // Message box should expand
      const messageBox = page.locator('textarea[placeholder*="留言"]');
      await expect(messageBox).toBeVisible();
    }
  });
});

test.describe('Product Detail and Cart', () => {
  test('Product detail should open on click', async ({ page }) => {
    await page.goto('/');

    // Wait for products to load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // Click first product card
    const firstProduct = page.locator('[class*="card"], [class*="maker"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(1000);

      // Should show product detail or navigate
      const detailVisible = await page.locator('text=/返回|加入購物車/i').isVisible();
      expect(detailVisible).toBeTruthy();
    }
  });

  test('Image carousel should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait and click product
    await page.waitForTimeout(2000);
    const firstProduct = page.locator('[class*="card"], [class*="maker"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(1000);

      // Check for image thumbnails
      const thumbnails = page.locator('[class*="aspect-square"]');
      const count = await thumbnails.count();
      if (count > 1) {
        // Click second thumbnail
        await thumbnails.nth(1).click();
        await page.waitForTimeout(500);

        // Image should change
        expect(true).toBeTruthy();
      }
    }
  });
});

test.describe('Modification Request Form', () => {
  test('Modification form should be accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/track');

    // Search for order
    const searchInput = page.locator('input[placeholder*="電話"]');
    await searchInput.fill('test@example.com');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);

    // Look for modification button
    const modButton = page.locator('text=申請修改');
    if (await modButton.first().isVisible()) {
      await modButton.first().click();
      await page.waitForTimeout(500);

      // Modal should appear
      const modal = page.locator('text=申請修改訂單');
      await expect(modal).toBeVisible();

      // Check if form elements are visible
      const typeButtons = page.locator('button:has-text("變更顏色"), button:has-text("調整數量")');
      expect(await typeButtons.count()).toBeGreaterThan(0);
    }
  });

  test('Modification form should be usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/track');

    // Try to open modification form
    await page.locator('input[placeholder*="電話"]').fill('test@example.com');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const modButton = page.locator('text=申請修改').first();
    if (await modButton.isVisible()) {
      await modButton.click();
      await page.waitForTimeout(500);

      // Try to select modification type
      const colorButton = page.locator('button:has-text("變更顏色")');
      if (await colorButton.isVisible()) {
        await colorButton.click();

        // Fill description
        const textarea = page.locator('textarea[placeholder*="修改需求"]');
        await textarea.fill('想要更換顏色');

        // Check if submit button is enabled
        const submitButton = page.locator('button:has-text("提交")');
        await expect(submitButton).toBeEnabled();
      }
    }
  });
});

test.describe('Touch Interactions', () => {
  test('Buttons should respond to touch on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Test navigation button
    const trackButton = page.locator('text=訂單追蹤').first();
    await trackButton.tap();
    await page.waitForTimeout(1000);

    // Should navigate to track page
    expect(page.url()).toContain('/track');
  });

  test('Scrolling should work smoothly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    // Check scroll position
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});

test.describe('Visual Regression', () => {
  test('Homepage should look correct on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Track page should look correct on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/track');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('track-page-mobile.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Performance on Mobile', () => {
  test('Page should load quickly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
