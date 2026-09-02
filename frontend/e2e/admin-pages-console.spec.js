import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  email: 'hello.superui@gmail.com',
  password: 'Thirupathi@2026'
};

const ADMIN_PAGES = [
  { name: 'Dashboard', path: '/india/admin/dashboard' },
  { name: 'Products', path: '/india/admin/products' },
  { name: 'Categories', path: '/india/admin/categories' },
  { name: 'Hero Images', path: '/india/admin/hero-images' },
  { name: 'Customers', path: '/india/admin/customers' },
  { name: 'Orders', path: '/india/admin/orders' },
  { name: 'Payments', path: '/india/admin/payments' },
  { name: 'Bookings', path: '/india/admin/bookings' },
  { name: 'Downloads', path: '/india/admin/downloads' },
  { name: 'Contacts / Messages', path: '/india/admin/contacts' },
  { name: 'Email Panel', path: '/india/admin/email' },
  { name: 'Telegram', path: '/india/admin/telegram' },
  { name: 'Settings', path: '/india/admin/settings' },
  { name: 'Navbar Menu', path: '/india/admin/navbar' },
  { name: 'Services', path: '/india/admin/services' },
  { name: 'Security', path: '/india/admin/security' },
  { name: 'Reports', path: '/india/admin/reports' },
  { name: 'Feedback', path: '/india/admin/feedback' },
  { name: 'Issues', path: '/india/admin/issues' },
  { name: 'Pricing Plans', path: '/india/admin/pricing' },
  { name: 'Visitor Report', path: '/india/admin/visitors' },
  { name: 'Pages Management', path: '/india/admin/pages' },
  { name: 'Testimonials', path: '/india/admin/testimonials' },
  { name: 'Page Config JSON', path: '/india/admin/page-config' }
];

let adminToken = '';
let adminProfile = null;

test.describe('Admin Pages Console Error Audit', () => {
  test.describe.configure({ mode: 'serial' });

  test('Step 0: Obtain admin authentication credentials', async ({ request }) => {
    try {
      const loginRes = await request.post(`${BACKEND_URL}/api/auth/admin-login`, {
        data: {
          email: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password
        }
      });
      if (loginRes.ok()) {
        const data = await loginRes.json();
        adminToken = data?.data?.token || 'demo-admin-token';
        adminProfile = data?.data?.user || {
          email: ADMIN_CREDENTIALS.email,
          name: 'SuperUI Admin',
          role: 'admin',
          mfaEnabled: true
        };
      }
    } catch (e) {
      console.warn('Backend login fallback used for testing');
    }

    if (!adminToken) {
      adminToken = 'demo-admin-token';
      adminProfile = {
        email: ADMIN_CREDENTIALS.email,
        name: 'SuperUI Admin',
        role: 'admin',
        mfaEnabled: true
      };
    }
  });

  for (const pageInfo of ADMIN_PAGES) {
    test(`Check admin page [${pageInfo.name}] for console errors (${pageInfo.path})`, async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out benign React devtools extension notice, transient Vite HMR events, and page transition aborts
          if (
            !text.includes('React DevTools') && 
            !text.includes('Download the React DevTools') &&
            !text.includes('[vite]') &&
            !text.includes('[hmr]') &&
            !text.includes('ERR_CONNECTION_RESET') &&
            !text.includes('ERR_ABORTED')
          ) {
            consoleErrors.push(text);
          }
        }
      });

      page.on('pageerror', err => {
        pageErrors.push(err.message || String(err));
      });

      // Inject authenticated admin state prior to page load
      await page.addInitScript(({ token, profile }) => {
        localStorage.setItem('admin_mfa_token', token);
        sessionStorage.setItem('admin_mfa_token', token);
        localStorage.setItem('admin_profile', JSON.stringify(profile));
        sessionStorage.setItem('admin_mfa_verified', 'true');
        localStorage.setItem('admin_mfa_enrolled', 'true');
      }, { token: adminToken, profile: adminProfile });

      // Navigate to admin page
      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500); // Allow async effects, queries, and layout rendering

      if (pageErrors.length > 0 || consoleErrors.length > 0) {
        console.error(`\n❌ Issues detected on ${pageInfo.name} (${pageInfo.path}):`);
        pageErrors.forEach(e => console.error(`  - [Page Error] ${e}`));
        consoleErrors.forEach(e => console.error(`  - [Console Error] ${e}`));
      }

      expect(pageErrors, `Uncaught page errors on ${pageInfo.name}`).toEqual([]);
      expect(consoleErrors, `Console errors on ${pageInfo.name}`).toEqual([]);
    });
  }
});
