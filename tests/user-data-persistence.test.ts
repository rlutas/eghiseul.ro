/**
 * User Data Persistence Feature Tests
 *
 * Tests for:
 * - GET /api/user/prefill-data
 * - POST /api/auth/register-from-order
 * - Database tables and functions
 *
 * Run with: npx ts-node tests/user-data-persistence.test.ts
 * Or import in your test framework
 */

const SUPABASE_URL = 'https://llbwmitdrppomeptqlue.supabase.co';
const API_BASE = 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function log(test: string, passed: boolean, message: string) {
  results.push({ name: test, passed, message });
  console.log(`${passed ? '✅' : '❌'} ${test}: ${message}`);
}

async function testPrefillDataUnauthorized() {
  try {
    const response = await fetch(`${API_BASE}/api/user/prefill-data`);
    if (response.status === 401) {
      log('Prefill Data (Unauthorized)', true, 'Returns 401 as expected');
    } else {
      log('Prefill Data (Unauthorized)', false, `Expected 401, got ${response.status}`);
    }
  } catch (error) {
    log('Prefill Data (Unauthorized)', false, `Error: ${error}`);
  }
}

async function testRegisterFromOrderMissingFields() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/register-from-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    if (response.status === 400) {
      const data = await response.json();
      log('Register (Missing Fields)', true, `Returns 400: ${data.message}`);
    } else {
      log('Register (Missing Fields)', false, `Expected 400, got ${response.status}`);
    }
  } catch (error) {
    log('Register (Missing Fields)', false, `Error: ${error}`);
  }
}

async function testRegisterFromOrderInvalidOrder() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/register-from-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        password: 'testpassword123',
        acceptedTerms: true,
        acceptedPrivacy: true,
      }),
    });

    if (response.status === 404) {
      const data = await response.json();
      log('Register (Invalid Order)', true, `Returns 404: ${data.message}`);
    } else {
      log('Register (Invalid Order)', false, `Expected 404, got ${response.status}`);
    }
  } catch (error) {
    log('Register (Invalid Order)', false, `Error: ${error}`);
  }
}

async function testRegisterFromOrderWeakPassword() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/register-from-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        password: '123', // Too short
        acceptedTerms: true,
        acceptedPrivacy: true,
      }),
    });

    if (response.status === 400) {
      const data = await response.json();
      log('Register (Weak Password)', true, `Returns 400: ${data.message}`);
    } else {
      log('Register (Weak Password)', false, `Expected 400, got ${response.status}`);
    }
  } catch (error) {
    log('Register (Weak Password)', false, `Error: ${error}`);
  }
}

async function testRegisterFromOrderNoTerms() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/register-from-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        password: 'testpassword123',
        acceptedTerms: false, // Not accepted
        acceptedPrivacy: true,
      }),
    });

    if (response.status === 400) {
      const data = await response.json();
      log('Register (No Terms)', true, `Returns 400: ${data.message}`);
    } else {
      log('Register (No Terms)', false, `Expected 400, got ${response.status}`);
    }
  } catch (error) {
    log('Register (No Terms)', false, `Error: ${error}`);
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('User Data Persistence Tests');
  console.log('='.repeat(60) + '\n');

  await testPrefillDataUnauthorized();
  await testRegisterFromOrderMissingFields();
  await testRegisterFromOrderInvalidOrder();
  await testRegisterFromOrderWeakPassword();
  await testRegisterFromOrderNoTerms();

  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`Results: ${passed}/${total} tests passed`);
  console.log('='.repeat(60) + '\n');

  return { passed, total, results };
}

// Export for use in test frameworks
export { runAllTests, results };

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
