import { browser } from 'k6/browser';
import { HomePage } from '../pages/home-page.js';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { getThresholds, getTestConfig, getBrowserConfig, getEnvironmentSelectors, getPerformanceExpectations } from '../utils/environment-config.js';

// Custom metrics for statistical validation
const stateUpdateLatency = new Trend('state_update_latency');
const memoryGrowth = new Trend('memory_growth');
const bootstrapTime = new Trend('bootstrap_time');
const statisticalReliability = new Rate('statistical_reliability');

// Get environment-specific configuration
const testConfig = getTestConfig(__ENV.APP_URL);
const browserConfig = getBrowserConfig(__ENV.APP_URL);

export const options = {
  scenarios: {
    // Warmup scenario to reduce variance
    warmup: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '1m',
      startTime: '0s',
      tags: { scenario: 'warmup' },
      options: {
        browser: {
          type: 'chromium',
          headless: browserConfig.headless,
        },
      },
    },

    // Main statistical test with multiple iterations
    statisticalTest: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 3, // Multiple iterations for statistical significance
      maxDuration: '8m',
      startTime: '1m10s', // Start after warmup
      tags: { scenario: 'main' },
      options: {
        browser: {
          type: 'chromium',
          headless: browserConfig.headless,
        },
      },
    },
  },
  thresholds: {
    ...getThresholds(__ENV.APP_URL),
    // Additional statistical thresholds
    'statistical_reliability': ['rate>0.8'], // 80% of iterations should be reliable
    'state_update_latency': ['p(95)<800', 'avg<600'], // Both percentile and average
    'bootstrap_time': ['p(90)<18000', 'avg<15000'], // 90th percentile and average
  },
};

export default async function statisticalRegressionTest() {
  const page = await browser.newPage();
  const homepage = new HomePage(page);

  try {
    const scenario = __ENV.K6_SCENARIO;

    if (scenario === 'warmup') {
      console.log('🔥 Warmup iteration - preparing browser state');
      await performWarmup(page, homepage);
    } else {
      console.log('📊 Statistical Regression Test - Iteration');
      console.log(getPerformanceExpectations(__ENV.APP_URL));

      const iterationReliable = await performMainTest(page, homepage);
      statisticalReliability.add(iterationReliable ? 1 : 0);
    }

  } catch (e) {
    console.log(`❌ Test iteration failed: ${e.message}`);
    statisticalReliability.add(0);
  } finally {
    await page.close();
  }
}

async function performWarmup(page, homepage) {
  // Simple warmup to establish browser state and cache
  await homepage.goto();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  console.log('✅ Warmup completed');
}

async function performMainTest(page, homepage) {
  let reliableData = true;

  try {
    // Test 1: Bootstrap Performance
    console.log('📊 Measuring bootstrap performance...');
    const bootstrapResult = await testBootstrapStatistical(page, homepage);
    if (!bootstrapResult.reliable) reliableData = false;

    // Test 2: Memory Patterns
    console.log('🧠 Measuring memory patterns...');
    const memoryResult = await testMemoryStatistical(page, homepage);
    if (!memoryResult.reliable) reliableData = false;

    // Test 3: State Update Performance
    console.log('⚡ Measuring state updates...');
    const stateResult = await testStateUpdatesStatistical(page, homepage);
    if (!stateResult.reliable) reliableData = false;

    console.log(`✅ Statistical iteration completed (reliable: ${reliableData})`);

    return reliableData;

  } catch (e) {
    console.log(`❌ Statistical test failed: ${e.message}`);
    return false;
  }
}

async function testBootstrapStatistical(page, homepage) {
  const measurements = [];

  // Take multiple bootstrap measurements
  for (let i = 0; i < 2; i++) {
    try {
      const startTime = Date.now();
      await homepage.goto();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForFunction(() => {
        return document.readyState === 'complete' &&
               (window.ng || document.querySelector('[ng-version]'));
      }, { timeout: 15000 });

      const bootstrapDuration = Date.now() - startTime;
      measurements.push(bootstrapDuration);

      console.log(`   Bootstrap ${i + 1}: ${bootstrapDuration}ms`);

      // Add small delay between measurements
      await page.waitForTimeout(500);

    } catch (e) {
      console.log(`⚠️ Bootstrap measurement ${i + 1} failed: ${e.message}`);
    }
  }

  if (measurements.length > 0) {
    const avgBootstrap = measurements.reduce((a, b) => a + b) / measurements.length;
    const variance = measurements.reduce((acc, val) => acc + Math.pow(val - avgBootstrap, 2), 0) / measurements.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgBootstrap;

    console.log(`   Average: ${Math.round(avgBootstrap)}ms, StdDev: ${Math.round(stdDev)}ms, CV: ${Math.round(coefficientOfVariation * 100)}%`);

    bootstrapTime.add(avgBootstrap);

    // Consider reliable if coefficient of variation is < 20%
    const reliable = coefficientOfVariation < 0.2 && measurements.length >= 2;

    check(avgBootstrap, {
      'bootstrap_statistical_consistent': () => reliable,
      'bootstrap_under_threshold': (time) => time < 18000,
    });

    return { reliable, value: avgBootstrap };
  }

  return { reliable: false, value: 0 };
}

async function testMemoryStatistical(page, homepage) {
  const measurements = [];

  try {
    await homepage.goto();
    await page.waitForLoadState('networkidle');

    const initialMemory = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });

    if (initialMemory === 0) {
      console.log('⚠️ Memory API not available - skipping statistical memory test');
      return { reliable: false, value: 0 };
    }

    // Perform multiple navigation cycles and measure memory
    for (let i = 0; i < 3; i++) {
      const beforeMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });

      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      const afterMemory = await page.evaluate(() => {
        if (window.gc) window.gc(); // Try to trigger GC
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });

      const memoryDelta = Math.abs(afterMemory - beforeMemory);
      measurements.push(memoryDelta);

      console.log(`   Memory cycle ${i + 1}: ${Math.round(memoryDelta / 1024 / 1024)}MB`);
    }

    if (measurements.length > 0) {
      const avgMemory = measurements.reduce((a, b) => a + b) / measurements.length;
      const maxMemory = Math.max(...measurements);

      console.log(`   Average memory growth: ${Math.round(avgMemory / 1024 / 1024)}MB`);
      console.log(`   Max memory growth: ${Math.round(maxMemory / 1024 / 1024)}MB`);

      memoryGrowth.add(avgMemory);

      const reliable = measurements.length >= 3 && maxMemory < avgMemory * 2;

      check(avgMemory, {
        'memory_statistical_consistent': () => reliable,
        'memory_under_threshold': (mem) => mem < 60 * 1024 * 1024, // 60MB
      });

      return { reliable, value: avgMemory };
    }

  } catch (e) {
    console.log(`⚠️ Statistical memory test failed: ${e.message}`);
  }

  return { reliable: false, value: 0 };
}

async function testStateUpdatesStatistical(page, homepage) {
  await homepage.goto();
  await page.waitForLoadState('networkidle');

  const measurements = [];
  const envSelectors = getEnvironmentSelectors(__ENV.APP_URL);

  // Try to find one reliable interactive element for consistent testing
  let testElement = null;
  let elementType = 'none';

  // Check for input first (most reliable)
  for (const selector of envSelectors.inputs) {
    try {
      const locator = page.locator(selector);
      if (await locator.count() > 0) {
        const element = locator.first();
        if (await element.isVisible() && await element.isEnabled()) {
          testElement = element;
          elementType = 'input';
          break;
        }
      }
    } catch (e) {
      // Continue trying other selectors
    }
  }

  // Fallback to buttons if no input found
  if (!testElement) {
    for (const selector of envSelectors.buttons) {
      try {
        const locator = page.locator(selector);
        if (await locator.count() > 0) {
          const element = locator.first();
          if (await element.isVisible() && await element.isEnabled()) {
            testElement = element;
            elementType = 'button';
            break;
          }
        }
      } catch (e) {
        // Continue trying
      }
    }
  }

  if (!testElement) {
    console.log('⚠️ No reliable interactive element found for statistical testing');
    return { reliable: false, value: 0 };
  }

  console.log(`   Testing ${elementType} interactions for statistical consistency`);

  // Perform multiple measurements
  for (let i = 0; i < 4; i++) {
    try {
      const startTime = await page.evaluate(() => performance.now());

      if (elementType === 'input') {
        await testElement.fill(`test-${i}`);
        await page.waitForTimeout(100);
        await testElement.clear();
      } else if (elementType === 'button') {
        await testElement.click();
        await page.waitForTimeout(200);
      }

      const endTime = await page.evaluate(() => performance.now());
      const duration = endTime - startTime;

      measurements.push(duration);
      console.log(`   Interaction ${i + 1}: ${Math.round(duration)}ms`);

    } catch (e) {
      console.log(`⚠️ Interaction ${i + 1} failed: ${e.message}`);
    }
  }

  if (measurements.length >= 2) {
    const avgTime = measurements.reduce((a, b) => a + b) / measurements.length;
    const variance = measurements.reduce((acc, val) => acc + Math.pow(val - avgTime, 2), 0) / measurements.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgTime;

    console.log(`   Average: ${Math.round(avgTime)}ms, StdDev: ${Math.round(stdDev)}ms, CV: ${Math.round(coefficientOfVariation * 100)}%`);

    stateUpdateLatency.add(avgTime);

    const reliable = coefficientOfVariation < 0.3 && measurements.length >= 3; // 30% CV threshold

    check(avgTime, {
      'state_statistical_consistent': () => reliable,
      'state_under_threshold': (time) => time < 700,
    });

    return { reliable, value: avgTime };
  }

  return { reliable: false, value: 0 };
}
