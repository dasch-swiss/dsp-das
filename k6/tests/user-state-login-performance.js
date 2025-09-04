import { browser } from 'k6/browser';
import { Trend, Rate } from 'k6/metrics';
import { getBrowserConfig, getPerformanceExpectations } from '../utils/environment-config.js';
import { HomePage } from '../pages/home-page.js';
import { ENVIRONMENTS } from '../options/constants.js';

// Custom metrics for NGXS vs UserService comparison
const loginDuration = new Trend('login_duration', true);
const userMenuAppearance = new Trend('user_menu_appearance', true);
const authFlowSuccess = new Rate('auth_flow_success');
const userStateUpdate = new Trend('user_state_update', true);

const APP_URL = __ENV.APP_URL || ENVIRONMENTS.DEV;
const VERSION_TAG = __ENV.VERSION || 'unknown';

export const options = {
  scenarios: {
    login_performance_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      options: {
        browser: {
          type: 'chromium',
          ...getBrowserConfig(APP_URL)
        }
      }
    }
  },
  thresholds: {
    'login_duration': ['avg<2000', 'p(95)<3000'],
    'user_menu_appearance': ['avg<1000', 'p(95)<2000'],
    'auth_flow_success': ['rate>0.9'],
    'user_state_update': ['avg<3000', 'p(95)<5000'],
  }
};

export function setup() {
  console.log(`🔍 Running User Service login performance test for version: ${VERSION_TAG}`);
  console.log(getPerformanceExpectations(APP_URL));
  return { version: VERSION_TAG, url: APP_URL };
}

export default async function(data) {
  const page = await browser.newPage();
  const homePage = new HomePage(page);
  
  try {
    console.log(`🚀 Testing login performance - Version: ${data.version}`);
    
    // Measure complete authentication flow timing
    const authFlowStart = performance.now();
    
    // Step 1: Navigate to homepage
    await homePage.goto();
    
    // Step 2: Measure login process (NGXS vs UserService impact)
    const loginStart = performance.now();
    
    await homePage.loginButton.click();
    await homePage.usernameInput.fill(__ENV.DSP_APP_USERNAME);
    await homePage.passwordInput.fill(__ENV.DSP_APP_PASSWORD);
    await homePage.submitButton.click();
    
    const loginEnd = performance.now();
    const loginTime = loginEnd - loginStart;
    
    // Step 3: Wait for user state to propagate to UI (UserService vs NGXS)
    const userStateStart = performance.now();
    
    try {
      await homePage.userMenu.waitFor({ state: 'visible', timeout: 5000 });
      const userStateEnd = performance.now();
      const userStateTime = userStateEnd - userStateStart;
      
      // Step 4: Verify user menu shows correct info (state propagation test)
      const isUserMenuVisible = await homePage.userMenu.isVisible();
      
      if (isUserMenuVisible) {
        const totalAuthTime = performance.now() - authFlowStart;
        
        // Record metrics with version tags for comparison
        loginDuration.add(loginTime, { version: data.version });
        userMenuAppearance.add(userStateTime, { version: data.version });
        userStateUpdate.add(totalAuthTime, { version: data.version });
        authFlowSuccess.add(1, { version: data.version });
        
        console.log(`✅ Auth success - Version: ${data.version}, Total: ${totalAuthTime.toFixed(0)}ms, Login: ${loginTime.toFixed(0)}ms, UserState: ${userStateTime.toFixed(0)}ms`);
        
        // Additional user state validation - check if user info loaded properly
        await page.waitForTimeout(500); // Allow any additional state updates
        
      } else {
        console.log(`❌ User menu not visible - Version: ${data.version}`);
        authFlowSuccess.add(0, { version: data.version });
      }
      
    } catch (error) {
      console.log(`❌ Login timeout or failed - Version: ${data.version}, Error: ${error.message}`);
      authFlowSuccess.add(0, { version: data.version });
    }
    
  } catch (error) {
    console.log(`❌ Test failed - Version: ${data.version}, Error: ${error.message}`);
    authFlowSuccess.add(0, { version: data.version });
  } finally {
    await page.screenshot({ path: `screenshots/login-performance-${data.version}-${Date.now()}.png` });
    await page.close();
  }
}

export function teardown(data) {
  console.log(`✅ Completed User Service login performance test for version: ${data.version}`);
}