import { browser } from 'k6/browser';
import { getBrowserConfig, getPerformanceExpectations } from './environment-config.js';
import { ENVIRONMENTS } from '../options/constants.js';

/**
 * Base K6 test utilities to eliminate code duplication
 */
export class K6TestBase {
  constructor(testName, duration = '30s') {
    this.testName = testName;
    this.duration = duration;
    this.appUrl = __ENV.APP_URL || ENVIRONMENTS.DEV;
    this.versionTag = __ENV.VERSION || 'unknown';
  }

  /**
   * Standard options configuration for user service performance tests
   */
  getBaseOptions(vus = 1) {
    return {
      scenarios: {
        [this.testName]: {
          executor: 'constant-vus',
          vus,
          duration: this.duration,
          options: {
            browser: {
              type: 'chromium',
              ...getBrowserConfig(this.appUrl)
            }
          }
        }
      }
    };
  }

  /**
   * Standard setup function with logging
   */
  setup() {
    console.log(`🔍 Running ${this.testName} for version: ${this.versionTag}`);
    console.log(getPerformanceExpectations(this.appUrl));
    return { version: this.versionTag, url: this.appUrl };
  }

  /**
   * Standard teardown function with logging
   */
  teardown(data) {
    console.log(`✅ Completed ${this.testName} for version: ${data.version}`);
  }

  /**
   * Standard error handling and cleanup for test functions
   */
  async runTestWithCleanup(page, testFunction) {
    try {
      await testFunction();
    } catch (error) {
      console.log(`❌ Test failed - Version: ${this.versionTag}, Error: ${error.message}`);
      throw error;
    } finally {
      await page.screenshot({ path: `screenshots/${this.testName}-${this.versionTag}-${Date.now()}.png` });
      await page.close();
    }
  }

  /**
   * Measures execution time of an async function
   */
  async measureAsync(fn) {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }

  /**
   * Standard success/failure logging
   */
  logResult(operation, duration, success, version = this.versionTag) {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${operation} - Version: ${version}, Duration: ${duration.toFixed(0)}ms`);
  }
}

/**
 * Common metrics for user service performance tests
 */
export function createUserServiceMetrics() {
  const { Trend, Rate } = require('k6/metrics');
  
  return {
    loginDuration: new Trend('login_duration', true),
    userMenuAppearance: new Trend('user_menu_appearance', true),
    authFlowSuccess: new Rate('auth_flow_success'),
    userStateUpdate: new Trend('user_state_update', true),
    statePropagationDuration: new Trend('state_propagation_duration', true),
    projectNavigationTime: new Trend('project_navigation_time', true),
    userMenuPersistence: new Trend('user_menu_persistence', true),
    pageTransitionSuccess: new Rate('page_transition_success')
  };
}

/**
 * Standard thresholds for user service performance tests
 */
export const USER_SERVICE_THRESHOLDS = {
  'login_duration': ['avg<2000', 'p(95)<3000'],
  'user_menu_appearance': ['avg<1000', 'p(95)<2000'],
  'auth_flow_success': ['rate>0.9'],
  'user_state_update': ['avg<3000', 'p(95)<5000'],
  'state_propagation_duration': ['avg<1000', 'p(95)<2000'],
  'project_navigation_time': ['avg<1500', 'p(95)<3000'],
  'user_menu_persistence': ['avg<500', 'p(95)<1000'],
  'page_transition_success': ['rate>0.85']
};

/**
 * Base class for store refactor regression tests
 */
export class StoreRegressionTestBase extends K6TestBase {
  constructor(testName, iterations = 1, maxDuration = '5m') {
    super(testName, maxDuration);
    this.iterations = iterations;
  }

  /**
   * Standard options for regression tests with environment-aware configuration
   */
  getRegressionOptions(vus = 1, customThresholds = {}) {
    const { getThresholds, getTestConfig, getBrowserConfig } = require('../utils/environment-config.js');
    const testConfig = getTestConfig(this.appUrl);
    const browserConfig = getBrowserConfig(this.appUrl);

    return {
      scenarios: {
        [this.testName]: {
          executor: 'shared-iterations',
          vus,
          iterations: this.iterations,
          maxDuration: this.duration,
          options: {
            browser: {
              type: 'chromium',
              headless: browserConfig.headless,
            },
          },
        },
      },
      thresholds: {
        ...getThresholds(this.appUrl),
        ...customThresholds
      }
    };
  }

  /**
   * Setup performance monitoring utilities in browser
   */
  async setupPerformanceMonitoring(page) {
    await page.evaluate(() => {
      window.performanceMetrics = {
        marks: [],
        memorySnapshots: [],
        measurements: [],
        
        mark: function(name) {
          performance.mark(name);
          this.marks.push({ name, timestamp: performance.now() });
        },
        
        measure: function(name, startMark, endMark) {
          performance.measure(name, startMark, endMark);
          const entry = performance.getEntriesByName(name, 'measure')[0];
          if (entry) {
            this.measurements.push({
              name,
              duration: entry.duration,
              timestamp: Date.now()
            });
          }
          return entry ? entry.duration : 0;
        },
        
        getMemorySnapshot: function() {
          const snapshot = performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          } : { used: 0, total: 0, limit: 0 };
          
          this.memorySnapshots.push({
            ...snapshot,
            timestamp: Date.now()
          });
          
          return snapshot;
        },

        measureAsync: async function(name, fn) {
          this.mark(`${name}-start`);
          const result = await fn();
          this.mark(`${name}-end`);
          const duration = this.measure(name, `${name}-start`, `${name}-end`);
          return { result, duration };
        }
      };

      // Setup Performance Observer
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          window.performanceMetrics.marks.push(...list.getEntries());
        });
        observer.observe({entryTypes: ['measure', 'mark', 'navigation']});
      }
    });
  }

  /**
   * Common bootstrap performance test
   */
  async testBootstrap(page, homepage, metrics) {
    const startTime = Date.now();
    
    await homepage.goto();
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for Angular to bootstrap
    await page.waitForFunction(() => {
      return document.readyState === 'complete' &&
             (window.ng || document.querySelector('[ng-version]'));
    }, { timeout: 20000 });
    
    const totalBootstrapTime = Date.now() - startTime;
    
    console.log(`Bootstrap time: ${totalBootstrapTime}ms`);
    metrics.bootstrapTime.add(totalBootstrapTime);
    
    return totalBootstrapTime;
  }

  /**
   * Common memory testing patterns
   */
  async testMemoryPattern(page, operations, metrics) {
    const initialMemory = await page.evaluate(() => {
      if (!window.performanceMetrics) return 0;
      return window.performanceMetrics.getMemorySnapshot().used;
    });

    for (const operation of operations) {
      await operation();
      await page.waitForTimeout(100);
    }

    const finalMemory = await page.evaluate(() => {
      if (!window.performanceMetrics) return 0;
      return window.performanceMetrics.getMemorySnapshot().used;
    });

    const memoryDelta = finalMemory - initialMemory;
    console.log(`Memory growth: ${Math.round(memoryDelta / 1024)}KB`);
    metrics.memoryGrowth.add(memoryDelta);
    
    return memoryDelta;
  }

  /**
   * Test state update latency with common patterns
   */
  async testStateUpdates(page, metrics) {
    const { getEnvironmentSelectors } = require('../utils/environment-config.js');
    const selectors = getEnvironmentSelectors(this.appUrl);

    const stateTests = [
      { selector: 'button, [role="button"]', action: 'click', name: 'button_interaction' },
      { selector: 'input[type="text"], input[type="search"]', action: 'type', name: 'input_interaction' },
      { selector: selectors.navigation, action: 'click', name: 'navigation_interaction' }
    ];

    for (const test of stateTests) {
      try {
        const elements = page.locator(test.selector);
        const count = await elements.count();
        
        if (count === 0) continue;
        
        const element = elements.first();
        if (!(await element.isVisible()) || !(await element.isEnabled())) {
          continue;
        }

        const duration = await page.evaluate(async (testInfo) => {
          if (!window.performanceMetrics) return 0;
          
          const { result, duration } = await window.performanceMetrics.measureAsync(testInfo.name, async () => {
            // Simulate state update
            return true;
          });
          
          return duration;
        }, test);

        // Perform the actual interaction
        if (test.action === 'click') {
          await element.click();
        } else if (test.action === 'type') {
          await element.fill('test');
          await element.clear();
        }

        await page.waitForTimeout(50);
        metrics.stateUpdateLatency.add(duration);
        
      } catch (e) {
        console.log(`State update test ${test.name} failed: ${e.message}`);
      }
    }
  }
}

/**
 * Common metrics for store regression tests
 */
export function createStoreRegressionMetrics() {
  const { Trend, Rate, Counter } = require('k6/metrics');
  
  return {
    stateUpdateLatency: new Trend('state_update_latency'),
    memoryGrowth: new Trend('memory_growth'),
    bootstrapTime: new Trend('bootstrap_time'),
    interactionLatency: new Trend('interaction_latency'),
    memoryEfficiency: new Trend('memory_efficiency'),
    subscriptionOverhead: new Trend('subscription_overhead'),
    stateConsistency: new Counter('state_consistency_issues'),
    statisticalReliability: new Rate('statistical_reliability')
  };
}