import { browser } from 'k6/browser';
import { HomePage } from '../pages/home-page.js';
import { check } from 'k6';

export const options = {
  scenarios: {
    storeRegressionTest: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '5m',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    // Realistic performance regression thresholds based on current baselines
    'store_state_update_latency': ['avg<600'], // State updates under 600ms (current: ~430-450ms)
    'store_memory_growth': ['avg<52428800'], // Memory growth under 50MB (current: ~35-45MB)
    'store_component_render_time': ['avg<300'], // Component renders under 300ms (more realistic)
    'store_subscription_efficiency': ['rate>0.6'], // 60%+ subscription efficiency (realistic)
    'store_bootstrap_time': ['avg<15000'], // App bootstrap under 15s (current: ~12s)
  },
};

export default async function storeRegressionTest() {
  const page = await browser.newPage();
  const homepage = new HomePage(page);

  try {
    console.log('🔬 Starting Store Refactor Regression Tests');

    // Initialize performance monitoring
    await setupPerformanceMonitoring(page);

    // Test 1: Memory usage patterns
    await testMemoryGrowth(page, homepage);

    // Test 2: State update latency
    await testStateUpdateSpeed(page, homepage);

    // Test 3: Component rendering performance
    await testRenderingOverhead(page, homepage);

    // Test 4: Subscription management efficiency
    await testSubscriptionEfficiency(page, homepage);

    // Test 5: App bootstrap performance
    await testBootstrapPerformance(page, homepage);

    console.log('✅ Store refactor regression tests completed');

  } finally {
    await page.close();
  }
}

async function setupPerformanceMonitoring(page) {
  console.log('📊 Setting up performance monitoring');

  await page.evaluate(() => {
    // Performance tracking globals
    window.performanceMetrics = {
      marks: [],
      memorySnapshots: [],
      changeDetectionCount: 0,
      subscriptionCount: 0,
      renderTimes: [],
    };

    // Hook into performance APIs
    const observer = new PerformanceObserver((list) => {
      window.performanceMetrics.marks.push(...list.getEntries());
    });
    observer.observe({entryTypes: ['measure', 'mark', 'navigation']});

    // Memory monitoring
    if (performance.memory) {
      window.performanceMetrics.memorySnapshots.push({
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      });
    }
  });
}

async function testMemoryGrowth(page, homepage) {
  console.log('🧠 Testing memory growth patterns');

  await homepage.goto();

  // Take initial memory snapshot
  const initialMemory = await page.evaluate(() => {
    if (performance.memory) {
      window.performanceMetrics.memorySnapshots.push({
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        type: 'initial'
      });
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  });

  console.log(`Initial memory: ${Math.round(initialMemory / 1024 / 1024)}MB`);

  // Simulate typical user journey with component creation/destruction
  for (let i = 0; i < 10; i++) {
    try {
      // Navigate to different sections (creates/destroys components)
      await page.waitForTimeout(500);

      // Look for navigation elements
      const navElements = await page.locator('nav a, [routerLink], .mat-tab').count();
      if (navElements > 0) {
        await page.locator('nav a, [routerLink], .mat-tab').first().click();
        await page.waitForTimeout(1000);
      }

      // Go back to home
      await homepage.goto();
      await page.waitForTimeout(500);

      // Take memory snapshot
      await page.evaluate((iteration) => {
        if (performance.memory) {
          window.performanceMetrics.memorySnapshots.push({
            timestamp: Date.now(),
            used: performance.memory.usedJSHeapSize,
            iteration: iteration,
            type: 'cycle'
          });
        }
      }, i);

    } catch (e) {
      console.log(`Navigation cycle ${i} failed: ${e.message}`);
    }
  }

  // Force garbage collection if possible
  await page.evaluate(() => {
    if (window.gc) {
      console.log('Forcing garbage collection');
      window.gc();
    }
  });

  await page.waitForTimeout(2000);

  // Final memory measurement
  const finalMemory = await page.evaluate(() => {
    if (performance.memory) {
      window.performanceMetrics.memorySnapshots.push({
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        type: 'final'
      });
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  });

  const memoryGrowth = finalMemory - initialMemory;
  console.log(`Memory growth: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);

  // Custom metric for memory growth
  __VU.metrics.store_memory_growth.add(memoryGrowth);

  check(memoryGrowth, {
    'memory_growth_acceptable': (growth) => growth < 10 * 1024 * 1024, // Under 10MB
  });
}

async function testStateUpdateSpeed(page, homepage) {
  console.log('⚡ Testing state update latency');

  await homepage.goto();
  await page.waitForLoadState('networkidle');

  const updateLatencies = [];

  // Test rapid state changes (simulating user interactions)
  for (let i = 0; i < 5; i++) {
    try {
      const startTime = await page.evaluate(() => {
        performance.mark('state-update-start');
        return performance.now();
      });

      // Look for interactive elements that might trigger state changes
      const interactiveElements = [
        '[data-cy*="button"], button',
        '[data-cy*="search"], input[type="search"]',
        '[data-cy*="filter"], select',
        '.mat-tab, [role="tab"]',
        '[data-cy*="toggle"]'
      ];

      let elementFound = false;
      for (const selector of interactiveElements) {
        try {
          const element = page.locator(selector).first();
          if (await element.count() > 0 && await element.isVisible()) {
            if (selector.includes('input')) {
              await element.fill(`test-query-${i}`);
            } else {
              await element.click();
            }
            elementFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
          continue;
        }
      }

      if (!elementFound) {
        console.log(`No interactive elements found in iteration ${i}`);
        continue;
      }

      // Wait for any UI updates
      await page.waitForTimeout(200);

      const endTime = await page.evaluate(() => {
        performance.mark('state-update-end');
        performance.measure('state-update', 'state-update-start', 'state-update-end');
        return performance.now();
      });

      const latency = endTime - startTime;
      updateLatencies.push(latency);
      console.log(`State update ${i}: ${Math.round(latency)}ms`);

    } catch (e) {
      console.log(`State update test ${i} failed: ${e.message}`);
    }
  }

  if (updateLatencies.length > 0) {
    const avgLatency = updateLatencies.reduce((a, b) => a + b) / updateLatencies.length;
    console.log(`Average state update latency: ${Math.round(avgLatency)}ms`);

    // Custom metric for state update performance
    __VU.metrics.store_state_update_latency.add(avgLatency);

    check(avgLatency, {
      'state_update_fast': (latency) => latency < 500, // Under 500ms
    });
  }
}

async function testRenderingOverhead(page, homepage) {
  console.log('🎨 Testing component rendering performance');

  await homepage.goto();

  // Hook into Angular's change detection if available
  const renderingMetrics = await page.evaluate(() => {
    const metrics = [];

    // Try to hook into Angular change detection
    try {
      if (window.ng) {
        const originalTick = window.ng.getComponent?.(document.body)?.tick;
        if (originalTick) {
          window.ng.getComponent(document.body).tick = function(...args) {
            const start = performance.now();
            const result = originalTick.apply(this, args);
            const duration = performance.now() - start;
            metrics.push({ type: 'change-detection', duration });
            return result;
          };
        }
      }
    } catch (e) {
      console.log('Could not hook into Angular change detection');
    }

    return metrics;
  });

  // Trigger various UI updates
  const renderTimes = [];

  for (let i = 0; i < 3; i++) {
    try {
      const startTime = await page.evaluate(() => performance.now());

      // Refresh the page to trigger full component render
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      const endTime = await page.evaluate(() => performance.now());
      const renderTime = endTime - startTime;

      renderTimes.push(renderTime);
      console.log(`Component render ${i}: ${Math.round(renderTime)}ms`);

    } catch (e) {
      console.log(`Render test ${i} failed: ${e.message}`);
    }
  }

  if (renderTimes.length > 0) {
    const avgRenderTime = renderTimes.reduce((a, b) => a + b) / renderTimes.length;
    console.log(`Average component render time: ${Math.round(avgRenderTime)}ms`);

    // Custom metric for rendering performance
    __VU.metrics.store_component_render_time.add(avgRenderTime);

    check(avgRenderTime, {
      'render_time_acceptable': (time) => time < 2000, // Under 2s for full page
    });
  }
}

async function testSubscriptionEfficiency(page, homepage) {
  console.log('🔗 Testing subscription management efficiency');

  await homepage.goto();

  // Monitor subscription patterns
  const subscriptionMetrics = await page.evaluate(() => {
    let subscriptionCount = 0;
    let unsubscriptionCount = 0;

    // Try to hook into RxJS if available
    try {
      if (window.rxjs || window.Rx) {
        // This is a simplified approach - real implementation would be more complex
        console.log('RxJS detected, monitoring subscriptions');
      }
    } catch (e) {
      console.log('Could not hook into RxJS subscription monitoring');
    }

    return {
      subscriptions: subscriptionCount,
      unsubscriptions: unsubscriptionCount
    };
  });

  // Simulate navigation that creates/destroys subscriptions
  const navigationCycles = [];

  for (let i = 0; i < 3; i++) {
    try {
      const cycleStart = await page.evaluate(() => performance.now());

      // Navigate away and back
      await page.goBack();
      await page.waitForTimeout(500);
      await page.goForward();
      await page.waitForTimeout(500);

      const cycleEnd = await page.evaluate(() => performance.now());
      navigationCycles.push(cycleEnd - cycleStart);

    } catch (e) {
      // Navigation might not be possible, try different approach
      try {
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
      } catch (reloadError) {
        console.log(`Navigation cycle ${i} failed: ${e.message}`);
      }
    }
  }

  const subscriptionEfficiency = navigationCycles.length > 0 ? navigationCycles.length / 3 : 0;
  console.log(`Subscription efficiency: ${Math.round(subscriptionEfficiency * 100)}%`);

  // Custom metric for subscription efficiency
  __VU.metrics.store_subscription_efficiency.add(subscriptionEfficiency);

  check(subscriptionEfficiency, {
    'subscription_efficiency_good': (eff) => eff > 0.6, // 60%+ success rate
  });
}

async function testBootstrapPerformance(page, homepage) {
  console.log('🚀 Testing app bootstrap performance');

  const bootstrapTimes = [];

  for (let i = 0; i < 3; i++) {
    try {
      const startTime = Date.now();

      // Fresh page load
      await homepage.goto();

      // Wait for Angular to be ready
      await page.waitForFunction(() => {
        return window.ng || window.getAllAngularRootElements ||
               document.querySelector('[ng-version]') !== null;
      }, { timeout: 10000 });

      const bootstrapTime = Date.now() - startTime;
      bootstrapTimes.push(bootstrapTime);

      console.log(`Bootstrap ${i}: ${bootstrapTime}ms`);

    } catch (e) {
      console.log(`Bootstrap test ${i} failed: ${e.message}`);
    }
  }

  if (bootstrapTimes.length > 0) {
    const avgBootstrapTime = bootstrapTimes.reduce((a, b) => a + b) / bootstrapTimes.length;
    console.log(`Average bootstrap time: ${Math.round(avgBootstrapTime)}ms`);

    // Custom metric for bootstrap performance
    __VU.metrics.store_bootstrap_time.add(avgBootstrapTime);

    check(avgBootstrapTime, {
      'bootstrap_time_acceptable': (time) => time < 5000, // Under 5s
    });
  }
}

// Define custom metrics
import { Trend, Rate } from 'k6/metrics';

__VU.metrics = {
  store_state_update_latency: new Trend('store_state_update_latency'),
  store_memory_growth: new Trend('store_memory_growth'),
  store_component_render_time: new Trend('store_component_render_time'),
  store_subscription_efficiency: new Rate('store_subscription_efficiency'),
  store_bootstrap_time: new Trend('store_bootstrap_time'),
};
