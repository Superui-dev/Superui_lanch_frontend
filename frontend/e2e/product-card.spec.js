import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';

// Test credentials from .env
const ADMIN_CREDENTIALS = {
  email: 'hello.superui@gmail.com',
  password: 'Thirupathi@2026'
};

let sharedAdminToken = null;
let sharedMfaToken = null;
let sharedTestProductId = null;

const testProduct = {
  name: `Test Product Card ${Date.now()}`,
  shortDescription: 'Testing product card rendering',
  description: 'This is a comprehensive test for product card display',
  originalPrice: 999,
  sellingPrice: 499,
  currency: 'INR',
  fileType: 'template',
  status: 'published',
  featured: true,
  category: 'Testing',
  thumbnail: {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    alt: 'Test Product'
  },
  tags: ['test', 'e2e', 'product-card'],
  metaTitle: 'Test Product Card',
  metaDescription: 'This is a test product for E2E testing'
};

test.describe('Product Card E2E Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('1. Authenticate admin user', async ({ request }) => {
    console.log('Attempting admin login...');
    
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/admin-login`, {
      data: {
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password
      }
    });

    console.log(`Login response status: ${loginResponse.status()}`);
    const loginData = await loginResponse.json();
    console.log(`Admin user:`, loginData?.data?.user?.email);

    expect(loginResponse.status()).toBeLessThan(400);
    
    sharedAdminToken = loginData?.data?.token || loginData?.token;
    
    expect(sharedAdminToken).toBeTruthy();
    console.log('✓ Admin authentication successful');
  });

  test('2. Create a product via admin API', async ({ request }) => {
    expect(sharedAdminToken).toBeTruthy();

    console.log('Creating product...');
    
    const createResponse = await request.post(
      `${BACKEND_URL}/api/admin/products`,
      {
        data: testProduct,
        headers: {
          'Authorization': `Bearer ${sharedAdminToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000  // 30 second timeout for product creation
      }
    );

    console.log(`Product creation response status: ${createResponse.status()}`);
    
    // If 403, it means MFA is required - try with test code
    if (createResponse.status() === 403) {
      console.log('MFA required, attempting to verify...');
      
      try {
        const mfaResponse = await request.post(
          `${BACKEND_URL}/api/auth/mfa/verify`,
          {
            data: { code: '123456' },
            headers: {
              'Authorization': `Bearer ${sharedAdminToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );
        
        console.log(`MFA response status: ${mfaResponse.status()}`);
        
        if (mfaResponse.status() < 400) {
          const mfaData = await mfaResponse.json();
          const mfaToken = mfaData?.data?.mfaToken || mfaData?.mfaToken;
          sharedMfaToken = mfaToken;
          
          // Retry with MFA token
          const retryResponse = await request.post(
            `${BACKEND_URL}/api/admin/products`,
            {
              data: testProduct,
              headers: {
                'Authorization': `Bearer ${sharedAdminToken}`,
                'x-mfa-token': mfaToken,
                'Content-Type': 'application/json'
              },
              timeout: 30000
            }
          );
          
          console.log(`Retry response status: ${retryResponse.status()}`);
          const retryData = await retryResponse.json();
          const createdProduct = retryData?.data || retryData;
          sharedTestProductId = createdProduct?._id || createdProduct?.id;
        }
      } catch (error) {
        console.warn('⚠ MFA verification failed:', error.message);
      }
    } else {
      const responseData = await createResponse.json();
      const createdProduct = responseData?.data || responseData;
      sharedTestProductId = createdProduct?._id || createdProduct?.id;
    }

    expect(sharedTestProductId).toBeTruthy();
    console.log(`✓ Product created successfully with ID: ${sharedTestProductId}`);
  });

  test('3. Fetch created product from public API', async ({ request }) => {
    expect(sharedTestProductId).toBeTruthy();

    const productsResponse = await request.get(
      `${BACKEND_URL}/api/public/products?limit=100`
    );

    expect(productsResponse.status()).toBeLessThan(400);
    const responseData = await productsResponse.json();
    const products = responseData?.data?.products || responseData?.products || [];
    
    console.log(`Total products fetched: ${products.length}`);
    const foundProduct = products.find(p => p._id === sharedTestProductId || p.name === testProduct.name);

    expect(foundProduct).toBeTruthy();
    expect(foundProduct.status).toBe('published');
    expect(foundProduct.name).toBe(testProduct.name);
    expect(foundProduct.thumbnail?.url).toBeTruthy();

    console.log('✓ Product successfully retrieved from public API');
  });

  test('4. Verify product data completeness', async ({ request }) => {
    expect(sharedTestProductId).toBeTruthy();

    const productsResponse = await request.get(
      `${BACKEND_URL}/api/public/products?limit=100`
    );

    const responseData = await productsResponse.json();
    const products = responseData?.data?.products || responseData?.products || [];
    const product = products.find(p => p._id === sharedTestProductId);

    expect(product).toBeTruthy();
    expect(product._id).toBe(sharedTestProductId);
    expect(product.name).toBe(testProduct.name);
    expect(product.sellingPrice).toBe(testProduct.sellingPrice);
    expect(product.originalPrice).toBe(testProduct.originalPrice);
    expect(product.currency).toBe(testProduct.currency);
    expect(product.status).toBe('published');
    
    console.log('✓ Product data is complete and correct');
  });

  test('5. Verify product featured flag', async ({ request }) => {
    expect(sharedTestProductId).toBeTruthy();

    const productsResponse = await request.get(
      `${BACKEND_URL}/api/public/products?featured=true&limit=100`
    );

    const responseData = await productsResponse.json();
    const products = responseData?.data?.products || responseData?.products || [];
    const product = products.find(p => p._id === sharedTestProductId);

    // Product should be in featured list
    expect(product).toBeTruthy();
    expect(product.featured).toBe(true);
    
    console.log('✓ Product featured flag is correct');
  });

  test('6. Test product search functionality', async ({ request }) => {
    const searchTerm = testProduct.name.substring(0, 15);
    
    const searchResponse = await request.get(
      `${BACKEND_URL}/api/public/products?search=${encodeURIComponent(searchTerm)}&limit=100`
    );

    const responseData = await searchResponse.json();
    const products = responseData?.data?.products || responseData?.products || [];
    const product = products.find(p => p._id === sharedTestProductId);

    expect(product).toBeTruthy();
    console.log(`✓ Product search for "${searchTerm}" successful`);
  });

  test('7. Cleanup - Delete test product', async ({ request }) => {
    if (sharedTestProductId && sharedAdminToken) {
      try {
        const headers = {
          'Authorization': `Bearer ${sharedAdminToken}`,
          'Content-Type': 'application/json'
        };
        if (sharedMfaToken) {
          headers['x-mfa-token'] = sharedMfaToken;
        }

        const deleteResponse = await request.delete(
          `${BACKEND_URL}/api/admin/products/${sharedTestProductId}`,
          {
            headers,
            timeout: 15000
          }
        );

        console.log(`Delete response status: ${deleteResponse.status()}`);
        expect([200, 201, 204, 403, 404].includes(deleteResponse.status())).toBeTruthy();
        console.log('✓ Test product cleanup completed');
      } catch (error) {
        console.warn('⚠ Failed to delete test product:', error.message);
      }
    }
  });
});
