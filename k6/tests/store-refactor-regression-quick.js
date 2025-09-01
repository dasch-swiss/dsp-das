import { browser } from 'k6/browser';
import { HomePage } from '../pages/home-page.js';
import { check } from 'k6';
import { Trend } from 'k6/metrics';
import { getThresholds, getTestConfig, getBrowserConfig, getEnvironmentSelectors, getPerformanceExpectations } from '../utils/environment-config.js';

// Custom metrics for store performance
const stateUpdateLatency = new Trend('state_update_latency');
const memoryGrowth = new Trend('memory_growth');
const bootstrapTime = new Trend('bootstrap_time');

// Get environment-specific configuration
const testConfig = getTestConfig(__ENV.APP_URL);
const browserConfig = getBrowserConfig(__ENV.APP_URL);

export const options = {
  scenarios: {
    quickRegressionTest: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: testConfig.iterations,
      maxDuration: testConfig.maxDuration,
      options: {
        browser: {
          type: 'chromium',
          headless: browserConfig.headless,
        },
      },
    },
  },
  thresholds: getThresholds(__ENV.APP_URL),
};

export default async function quickRegressionTest() {
  const page = await browser.newPage();
  const homepage = new HomePage(page);

  try {
    console.log('🔬 Quick Store Regression Test Starting');
    console.log(getPerformanceExpectations(__ENV.APP_URL));

    // Test 1: Bootstrap Performance
    console.log('📊 Testing bootstrap performance...');
    await testBootstrap(page, homepage);

    // Test 2: Basic Memory Check
    console.log('🧠 Testing memory patterns...');
    await testMemoryBasic(page, homepage);

    // Test 3: State Update Speed
    console.log('⚡ Testing state updates...');
    await testStateUpdates(page, homepage);

    console.log('✅ Quick regression test completed');

  } finally {
    await page.close();
  }
}

async function testBootstrap(page, homepage) {
  const startTime = Date.now();

  await homepage.goto();

  // Wait for page to be interactive
  await page.waitForLoadState('domcontentloaded');

  // Wait for Angular to bootstrap
  await page.waitForFunction(() => {
    return document.readyState === 'complete' &&
           (window.ng || document.querySelector('[ng-version]'));
  }, { timeout: 10000 });

  const totalBootstrapTime = Date.now() - startTime;

  console.log(`Bootstrap time: ${totalBootstrapTime}ms`);
  bootstrapTime.add(totalBootstrapTime);

  check(totalBootstrapTime, {
    'bootstrap_under_5s': (time) => time < 5000,
    'bootstrap_under_3s': (time) => time < 3000,
  });
}

async function testMemoryBasic(page, homepage) {
  // Get initial memory
  const initialMemory = await page.evaluate(() => {
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  });

  if (initialMemory === 0) {
    console.log('⚠️ Memory API not available');
    return;
  }

  console.log(`Initial memory: ${Math.round(initialMemory / 1024 / 1024)}MB`);

  // Perform some navigation cycles
  for (let i = 0; i < 3; i++) {
    try {
      // Reload page to create/destroy components
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

    } catch (e) {
      console.log(`⚠️ Memory test cycle ${i} failed: ${e.message || 'Navigation error'}`);
      console.log(`   Attempting to continue with remaining cycles...`);
    }
  }

  // Get final memory
  const finalMemory = await page.evaluate(() => {
    // Try to trigger garbage collection
    if (window.gc) window.gc();
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  });

  const growth = finalMemory - initialMemory;
  console.log(`Memory growth: ${Math.round(growth / 1024 / 1024)}MB`);

  memoryGrowth.add(growth);

  check(growth, {
    'memory_growth_under_5mb': (g) => g < 5 * 1024 * 1024,
    'memory_growth_under_10mb': (g) => g < 10 * 1024 * 1024,
  });
}

// Utility function for robust element selection with multiple strategies
async function findInteractiveElement(page, selectors, elementType) {
  const strategies = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of strategies) {
    try {
      const locator = page.locator(selector);
      const count = await locator.count();

      if (count > 0) {
        // Try to find a visible and enabled element
        for (let i = 0; i < Math.min(count, 3); i++) {
          const element = locator.nth(i);
          if (await element.isVisible() && await element.isEnabled()) {
            console.log(`✅ Found ${elementType} element: ${selector} (index ${i})`);
            return element;
          }
        }
      }
    } catch (e) {
      console.log(`⚠️ Selector "${selector}" failed: ${e.message}`);
    }
  }

  console.log(`❌ No interactive ${elementType} elements found`);
  return null;
}

async function testStateUpdates(page, homepage) {
  await homepage.goto();
  await page.waitForLoadState('networkidle');

  const updateTimes = [];
  const envSelectors = getEnvironmentSelectors(__ENV.APP_URL);

  // Test different types of interactions using environment-specific selectors
  const interactions = [
    // Navigation interaction
    {
      name: 'navigation',
      test: async () => {
        const element = await findInteractiveElement(page, envSelectors.navigation, 'navigation');
        if (element) {
          await element.click();
          await page.waitForTimeout(500);
          return true;
        }
        return false;
      }
    },

    // Form interaction
    {
      name: 'form input',
      test: async () => {
        const element = await findInteractiveElement(page, envSelectors.inputs, 'input');
        if (element) {
          await element.fill('test-state-update');
          await page.waitForTimeout(200);
          await element.clear(); // Clean up
          return true;
        }
        return false;
      }
    },

    // Button interaction
    {
      name: 'button',
      test: async () => {
        const element = await findInteractiveElement(page, envSelectors.buttons, 'button');
        if (element) {
          await element.click();
          await page.waitForTimeout(300);
          return true;
        }
        return false;
      }
    }
  ];

  for (let i = 0; i < interactions.length; i++) {
    const interaction = interactions[i];
    try {
      console.log(`🧪 Testing ${interaction.name} interaction...`);
      const startTime = await page.evaluate(() => performance.now());

      const interactionSucceeded = await interaction.test();

      if (interactionSucceeded) {
        const endTime = await page.evaluate(() => performance.now());
        const duration = endTime - startTime;

        updateTimes.push(duration);
        console.log(`✅ ${interaction.name}: ${Math.round(duration)}ms`);
      } else {
        console.log(`⚠️ ${interaction.name}: No suitable elements found`);
      }

    } catch (e) {
      console.log(`❌ ${interaction.name} failed: ${e.message || 'Unknown error'}`);
      console.log(`   Error details: ${e.stack ? e.stack.substring(0, 150) + '...' : 'No stack trace'}`);
    }
  }

  if (updateTimes.length > 0) {
    const avgTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length;
    console.log(`Average interaction time: ${Math.round(avgTime)}ms`);

    stateUpdateLatency.add(avgTime);

    check(avgTime, {
      'interactions_under_1s': (time) => time < 1000,
      'interactions_under_500ms': (time) => time < 500,
    });
  } else {
    console.log('⚠️ No interactions could be tested');
  }
}
