import { test, expect } from '@playwright/test';
import fs from 'fs';

const consoleErrors = [];
const pageErrors = [];

test.describe('SuperUI Full Stack Pin-to-Pin Test Suite', () => {
   test.beforeEach(async ({ page }) => {
     consoleErrors.length = 0;
     pageErrors.length = 0;
     page.on('console', (msg) => {
       const type = msg.type();
       if (type === 'error' || type === 'warning') {
         consoleErrors.push(`[${msg.location()}][${type}] ${msg.text()}`);
       }
     });
     page.on('pageerror', (err) => {
       pageErrors.push(String(err && err.stack ? err.stack : err));
     });
   });

  test.afterEach(async () => {
    const allErrors = [
      ...pageErrors.map((e) => `PAGEERROR: ${e}`),
      ...consoleErrors.map((e) => `CONSOLE: ${e}`),
    ];
    if (allErrors.length) {
      fs.appendFileSync('e2e-console-errors.log', `\n=== ${test.info().title} ===\n${allErrors.join('\n')}\n`);
      test.info().attach('console-page-errors', { body: allErrors.join('\n'), contentType: 'text/plain' });
      expect(allErrors, 'No console or page errors should occur').toHaveLength(0);
    }
  });

  // ==========================================
  // 1. BACKEND API INTEGRITY CHECKS
  // ==========================================
  test.describe('Backend API Checks', () => {
    test('1.1 Health check endpoint returns 200 OK', async ({ request }) => {
      const response = await request.get('http://localhost:5000/healthz');
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('ok');
    });

    test('1.2 Public Categories API returns categories list', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/public/categories');
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('1.3 Public Products API returns published products with populated categories', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/public/products');
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      const products = data.data.products || data.data;
      expect(Array.isArray(products)).toBe(true);

      if (products.length > 0) {
        const first = products[0];
        expect(first.name).toBeDefined();
        expect(first.slug).toBeDefined();
        expect(first.sellingPrice || first.price).toBeDefined();
      }
    });

    test('1.4 Public Settings and Testimonials APIs return successfully', async ({ request }) => {
      const [settingsRes, testimonialsRes] = await Promise.all([
        request.get('http://localhost:5000/api/public/settings'),
        request.get('http://localhost:5000/api/public/testimonials')
      ]);
      expect(settingsRes.status()).toBe(200);
      expect(testimonialsRes.status()).toBe(200);
    });
  });

  // ==========================================
  // 2. FRONTEND HOMEPAGE & PRODUCT CARDS
  // ==========================================
  test.describe('Frontend Homepage Flow', () => {
    test('2.1 Homepage loads with hero, branding and elements', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/SuperUI/i);
      
      const brand = page.locator('text=SuperUI').first();
      await expect(brand).toBeVisible();

      const exploreBtn = page.getByRole('link', { name: /explore products store/i });
      await expect(exploreBtn).toBeVisible();
    });

    test('2.2 Verified Store Catalog section renders product cards on frontend', async ({ page }) => {
      await page.goto('/');

      const catalogHeading = page.locator('text=Verified Store Catalog').first();
      await expect(catalogHeading).toBeVisible({ timeout: 15000 });

       // Wait for product card to render after API fetch
       const productTitle = page.locator('h3:has-text("Portfolio SuperUI New"), h3:has-text("Modern Analytics Dashboard UI Kit"), h3:has-text("SuperUI SaaS Landing Template")').first();
       await expect(productTitle).toBeVisible({ timeout: 15000 });

      // Verify product card details (thumbnail, price, action buttons)
      const card = productTitle.locator('xpath=ancestor::div[contains(@class, "group")][1]');
      await expect(card).toBeVisible();
      await expect(card.locator('img')).toBeVisible();
      await expect(card.locator('button:has-text("Buy Now")').first()).toBeVisible();
      await expect(card.locator('button:has-text("Add")').first()).toBeVisible();

      const productCards = page.locator('div.group.bg-white.rounded-2xl');
      const count = await productCards.count();
      console.log(`[Playwright] Verified ${count} live product card(s) on Homepage.`);
      expect(count).toBeGreaterThan(0);
    });

    test('2.3 Homepage search bar filters products dynamically', async ({ page }) => {
       await page.goto('/');
       await expect(page.locator('h3:has-text("Portfolio SuperUI New")').first()).toBeVisible({ timeout: 15000 });

      const searchInput = page.getByPlaceholder(/What type of design are you interested in/i);
      await expect(searchInput).toBeVisible();

      // Search for 'Portfolio' (matches Portfolio SuperUI New)
      await searchInput.fill('Portfolio');
      await expect(page.locator('h3:has-text("Portfolio SuperUI New")').first()).toBeVisible();

      // Clear search
      await searchInput.fill('');
      await expect(page.locator('h3:has-text("Portfolio SuperUI New")').first()).toBeVisible();
    });

    test('2.4 Services section renders with booking CTA', async ({ page }) => {
      await page.goto('/');
      const servicesSection = page.locator('text=Services');
      await expect(servicesSection.first()).toBeVisible();

      const bookCallBtn = page.getByRole('button', { name: /book a free call/i }).first();
      await expect(bookCallBtn).toBeVisible();
    });

    test('2.5 FAQ accordion expands and collapses', async ({ page }) => {
      await page.goto('/');
      const firstFaq = page.locator('text=What types of digital products do you sell?');
      if (await firstFaq.isVisible()) {
        await firstFaq.click();
        await page.waitForTimeout(300);
        await expect(page.locator('text=We sell a wide range of premium digital products')).toBeVisible();
      }
    });
  });

  // ==========================================
  // 3. FRONTEND STORE CATALOG PAGE (/products)
  // ==========================================
  test.describe('Products Store Catalog Page', () => {
    test('3.1 /products page renders header, search and category controls', async ({ page }) => {
      await page.goto('/products');
      await expect(page.locator('text=SuperUI Store Catalog')).toBeVisible({ timeout: 15000 });

      const searchBox = page.getByPlaceholder(/Search products/i);
      await expect(searchBox).toBeVisible();

      const allProductsBtn = page.locator('button:has-text("All Products")').first();
      await expect(allProductsBtn).toBeVisible();
    });

    test('3.2 /products catalog displays cards with prices and action buttons', async ({ page }) => {
      await page.goto('/products');

      // Wait for products to load
      const productTitle = page.locator('h3:has-text("Portfolio SuperUI New"), h3:has-text("Modern Analytics Dashboard UI Kit"), h3:has-text("SuperUI SaaS Landing Template")').first();
      await expect(productTitle).toBeVisible({ timeout: 15000 });

      const card = productTitle.locator('xpath=ancestor::div[contains(@class, "group")][1]');
      await expect(card).toBeVisible();
      await expect(card.locator('a:has-text("Details")').first()).toBeVisible();

      const productCards = page.locator('div.group.bg-white.rounded-2xl');
      const count = await productCards.count();
      console.log(`[Playwright] Verified ${count} live product card(s) on /products listing.`);
      expect(count).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 4. PORTFOLIO & SERVICES PAGES
  // ==========================================
  test.describe('Portfolio & Services Pages', () => {
    test('4.1 /portfolio page loads correctly', async ({ page }) => {
      await page.goto('/portfolio');
      await expect(page.getByRole('heading', { name: 'PORTFOLIO', exact: true })).toBeVisible({ timeout: 15000 });
    });

    test('4.2 /services page loads services', async ({ page }) => {
      await page.goto('/services');
      await expect(page.locator('text=Services').first()).toBeVisible({ timeout: 15000 });
    });

    test('4.3 /contact page displays contact channels', async ({ page }) => {
      await page.goto('/contact');
      await expect(page.locator('text=Contact').first()).toBeVisible({ timeout: 15000 });
    });
  });

  // ==========================================
  // 5. ADMIN PANEL FLOW & PRODUCT EDITING
  // ==========================================
  test.describe('Admin Panel Flow', () => {
    test('5.1 /india/admin/login renders login portal safely', async ({ page }) => {
      await page.goto('/india/admin/login');
      await expect(page.locator('text=Admin Access')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('5.2 /india/admin/products loads product edit modal with images, text, and features', async ({ page }) => {
      // Set admin authentication session and signed JWT in browser
      await page.addInitScript(() => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlbGxvLnN1cGVydWlAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiYXV0aFVzZXJJZCI6ImFkbWluX21hc3Rlcl8xIiwidXNlcklkIjoiNmE5OTFlMTkzOTMyZmY1ZTc2ZWJkMTg1IiwiaWF0IjoxNzg4NjExMTkwLCJleHAiOjE3OTEyMDMxOTB9.fsXUGnx2k5ubPde4royR_U_0SyXv-6C3u1JpP5sNOeg';
        localStorage.setItem('admin_profile', JSON.stringify({
          _id: '6a991e193932ff5e76ebd185',
          email: 'hello.superui@gmail.com',
          name: 'SuperUI Admin',
          role: 'admin',
          mfaEnabled: true
        }));
        sessionStorage.setItem('admin_mfa_verified', 'true');
        localStorage.setItem('admin_mfa_enrolled', 'true');
        sessionStorage.setItem('admin_mfa_token', token);
        localStorage.setItem('admin_mfa_token', token);
      });

      await page.goto('/india/admin/products');
      await expect(page.locator('h1:has-text("Product Catalog")')).toBeVisible({ timeout: 15000 });

      // Locate product card for "Portfolio SuperUI New" or other real products
      const targetTitle = page.locator('h3:has-text("Portfolio SuperUI New"), h3:has-text("Modern Analytics Dashboard UI Kit"), h3:has-text("SuperUI SaaS Landing Template")').first();
      await expect(targetTitle).toBeVisible({ timeout: 15000 });

      // Click Edit button on the card
      const productCard = targetTitle.locator('xpath=ancestor::div[contains(@class, "group")][1]');
      const editBtn = productCard.locator('button:has-text("Edit")');
      await editBtn.click();

      // Verify Edit Modal appears
      const modalHeader = page.locator('h2:has-text("Edit Product")');
      await expect(modalHeader).toBeVisible({ timeout: 5000 });

      // 1. Basic Info Tab checks
      const nameInput = page.locator('input[placeholder="e.g. Aether Dashboard Pro"]');
      await expect(nameInput).toHaveValue(/Portfolio SuperUI|Modern Analytics|SuperUI SaaS/i);

      const priceInput = page.locator('input[placeholder="2999"]');
      await expect(priceInput).toBeVisible();

      const sellingPriceInput = page.locator('input[placeholder="999"]');
      await expect(sellingPriceInput).toBeVisible();

      // 2. Media Tab checks
      await page.locator('button:has-text("Media")').click();
      const coverImageBadge = page.locator('text=COVER IMAGE');
      await expect(coverImageBadge.first()).toBeVisible();

      // 3. Technical Tab checks
      await page.locator('button:has-text("Technical")').click();
      const techInput = page.locator('input[placeholder*="React, Tailwind CSS"]');
      await expect(techInput).toBeVisible();

      const featuresArea = page.locator('textarea[placeholder*="Fully responsive design"]');
      await expect(featuresArea).toBeVisible();
      const featuresVal = await featuresArea.inputValue();
      expect(featuresVal).not.toContain('[object Object]');

      // 4. Links Tab checks
      await page.locator('button:has-text("Links")').click();
      const previewInput = page.locator('input[placeholder="https://preview.example.com"]');
      await expect(previewInput).toBeVisible();

      // Close modal cleanly
      const closeBtn = page.locator('button:has(svg.lucide-x)').first();
      await closeBtn.click();
      await expect(modalHeader).not.toBeVisible();
    });
  });
});
