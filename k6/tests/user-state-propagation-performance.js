import { browser } from 'k6/browser';
import { Trend, Rate } from 'k6/metrics';
import { getBrowserConfig, getPerformanceExpectations } from '../utils/environment-config.js';
import { HomePage } from '../pages/home-page.js';
import { ProjectOverviewPage } from '../pages/project-overview-page.js';
import { ENVIRONMENTS } from '../options/constants.js';

// Custom metrics for user state propagation across pages
const statePropagationDuration = new Trend('state_propagation_duration', true);
const projectNavigationTime = new Trend('project_navigation_time', true);
const userMenuPersistence = new Trend('user_menu_persistence', true);
const pageTransitionSuccess = new Rate('page_transition_success');

const APP_URL = __ENV.APP_URL || ENVIRONMENTS.DEV;
const VERSION_TAG = __ENV.VERSION || 'unknown';

export const options = {
  scenarios: {
    user_state_propagation: {
      executor: 'constant-vus',
      vus: 1,
      duration: '45s',
      options: {
        browser: {
          type: 'chromium',
          ...getBrowserConfig(APP_URL)
        }
      }
    }
  },
  thresholds: {
    'state_propagation_duration': ['avg<1000', 'p(95)<2000'],
    'project_navigation_time': ['avg<1500', 'p(95)<3000'],
    'user_menu_persistence': ['avg<500', 'p(95)<1000'],
    'page_transition_success': ['rate>0.85'],
  }
};

export function setup() {
  console.log(`🔍 Running User State propagation test for version: ${VERSION_TAG}`);
  console.log(getPerformanceExpectations(APP_URL));
  return { version: VERSION_TAG, url: APP_URL };
}

export default async function(data) {
  const page = await browser.newPage();
  const homePage = new HomePage(page);
  const projectPage = new ProjectOverviewPage(page);
  
  try {
    console.log(`🚀 Testing user state propagation - Version: ${data.version}`);
    
    // Step 1: Login and establish user state
    await homePage.goto();
    await homePage.login();
    await homePage.userMenu.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log(`✅ Initial login successful - Version: ${data.version}`);
    
    // Step 2: Test user state propagation across different pages
    const propagationTests = [
      {
        name: 'project_overview',
        action: async () => {
          const navStart = performance.now();
          await projectPage.goto();
          
          // Wait for page to load and user state to be available
          await page.waitForLoadState('networkidle');
          
          // Check if user menu persists (indicates user state propagated)
          const userMenuStart = performance.now();
          const userMenuVisible = await page.locator('[data-cy=user-button]').isVisible();
          const userMenuEnd = performance.now();
          
          const navEnd = performance.now();
          
          return {
            navigationTime: navEnd - navStart,
            userMenuTime: userMenuEnd - userMenuStart,
            success: userMenuVisible
          };
        }
      },
      {
        name: 'user_settings_navigation',
        action: async () => {
          const navStart = performance.now();
          
          // Navigate to user settings (highly user-state dependent)
          await page.locator('[data-cy=user-button]').click();
          
          // Look for user menu options that depend on user state
          const userMenuOptions = page.locator('[data-cy=user-menu] a');
          await userMenuOptions.first().waitFor({ state: 'visible', timeout: 3000 });
          
          const navEnd = performance.now();
          const menuItemCount = await userMenuOptions.count();
          
          return {
            navigationTime: navEnd - navStart,
            success: menuItemCount > 0
          };
        }
      },
      {
        name: 'home_navigation_return',
        action: async () => {
          const navStart = performance.now();
          
          // Return to home and check if user state is still consistent
          await homePage.goto();
          await page.waitForLoadState('networkidle');
          
          // Verify user menu is still visible and responsive
          const userMenuVisible = await homePage.userMenu.isVisible();
          const userMenuEnd = performance.now();
          
          return {
            navigationTime: userMenuEnd - navStart,
            success: userMenuVisible
          };
        }
      }
    ];
    
    // Execute all propagation tests
    let allTestsSuccessful = true;
    const totalPropagationStart = performance.now();
    
    for (const test of propagationTests) {
      try {
        console.log(`🔄 Running ${test.name} test - Version: ${data.version}`);
        
        const result = await test.action();
        
        // Record metrics
        if (test.name === 'project_overview') {
          projectNavigationTime.add(result.navigationTime, { version: data.version });
          userMenuPersistence.add(result.userMenuTime, { version: data.version });
        } else {
          statePropagationDuration.add(result.navigationTime, { version: data.version });
        }
        
        if (!result.success) {
          allTestsSuccessful = false;
          console.log(`❌ ${test.name} failed - Version: ${data.version}`);
        } else {
          console.log(`✅ ${test.name} success (${result.navigationTime.toFixed(0)}ms) - Version: ${data.version}`);
        }
        
        // Small pause between tests to let state settle
        await page.waitForTimeout(200);
        
      } catch (error) {
        console.log(`❌ ${test.name} error - Version: ${data.version}, Error: ${error.message}`);
        allTestsSuccessful = false;
      }
    }
    
    const totalPropagationEnd = performance.now();
    const totalPropagationTime = totalPropagationEnd - totalPropagationStart;
    
    // Record overall success rate
    pageTransitionSuccess.add(allTestsSuccessful ? 1 : 0, { version: data.version });
    
    console.log(`🏁 State propagation complete - Version: ${data.version}, Total: ${totalPropagationTime.toFixed(0)}ms, Success: ${allTestsSuccessful}`);
    
  } catch (error) {
    console.log(`❌ Test suite failed - Version: ${data.version}, Error: ${error.message}`);
    pageTransitionSuccess.add(0, { version: data.version });
  } finally {
    await page.screenshot({ path: `screenshots/state-propagation-${data.version}-${Date.now()}.png` });
    await page.close();
  }
}

export function teardown(data) {
  console.log(`✅ Completed User State propagation test for version: ${data.version}`);
}