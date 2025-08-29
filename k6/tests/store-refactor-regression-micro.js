import { browser } from 'k6/browser';
import { HomePage } from '../pages/home-page.js';
import { check } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Micro-benchmarks for store vs BehaviorSubject performance
const interactionLatency = new Trend('interaction_latency');
const memoryEfficiency = new Trend('memory_efficiency');
const subscriptionOverhead = new Trend('subscription_overhead');
const stateConsistency = new Counter('state_consistency_issues');

export const options = {
  scenarios: {
    microBenchmarks: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '30s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    'interaction_latency': ['p(95)<300'], // 95% of interactions under 300ms
    'memory_efficiency': ['avg<1048576'], // Average memory per operation under 1MB
    'subscription_overhead': ['avg<50'], // Subscription overhead under 50ms
    'state_consistency_issues': ['count<1'], // No consistency issues
  },
};

export default async function microBenchmarks() {
  const page = await browser.newPage();
  const homepage = new HomePage(page);

  try {
    console.log('🔬 Store vs BehaviorSubject Micro-benchmarks');
    
    await setupMicroBenchmarking(page);
    await homepage.goto();
    await page.waitForLoadState('networkidle');
    
    // Run micro-benchmarks
    await testInteractionLatency(page);
    await testMemoryEfficiency(page);
    await testSubscriptionOverhead(page);
    await testStateConsistency(page);
    
    console.log('✅ Micro-benchmarks completed');
    
  } finally {
    await page.close();
  }
}

async function setupMicroBenchmarking(page) {
  await page.evaluate(() => {
    // Setup performance measurement utilities
    window.microBench = {
      startTime: null,
      measurements: [],
      
      start: function(name) {
        this.startTime = performance.now();
        performance.mark(`${name}-start`);
      },
      
      end: function(name) {
        const endTime = performance.now();
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const duration = endTime - this.startTime;
        this.measurements.push({
          name: name,
          duration: duration,
          timestamp: Date.now()
        });
        
        return duration;
      },
      
      getMemorySnapshot: function() {
        return performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null;
      }
    };
  });
}

async function testInteractionLatency(page) {
  console.log('⚡ Testing user interaction latency');
  
  // Find interactive elements to test
  const testElements = [
    { selector: 'button, [role="button"]', action: 'click', name: 'button_click' },
    { selector: 'input[type="text"], input[type="search"]', action: 'type', name: 'input_type' },
    { selector: 'a, [routerLink]', action: 'click', name: 'navigation_click' },
    { selector: 'select, .mat-select', action: 'click', name: 'select_click' },
  ];
  
  for (const test of testElements) {
    try {
      const elements = page.locator(test.selector);
      const count = await elements.count();
      
      if (count === 0) {
        console.log(`⚠️ No ${test.name} elements found`);
        continue;
      }
      
      const element = elements.first();
      
      // Skip if not visible/enabled
      if (!(await element.isVisible()) || !(await element.isEnabled())) {
        continue;
      }
      
      // Measure interaction latency
      const latency = await page.evaluate(async (testName) => {
        window.microBench.start(testName);
        return testName;
      }, test.name);
      
      // Perform interaction
      if (test.action === 'click') {
        await element.click();
      } else if (test.action === 'type') {
        await element.fill('perf-test');
      }
      
      // Wait for any state updates
      await page.waitForTimeout(50);
      
      const duration = await page.evaluate((testName) => {
        return window.microBench.end(testName);
      }, test.name);
      
      console.log(`${test.name}: ${Math.round(duration)}ms`);
      interactionLatency.add(duration);
      
      // Reset state for next test
      if (test.action === 'type') {
        await element.clear();
      }
      
    } catch (e) {
      console.log(`⚠️ ${test.name} test failed: ${e.message}`);
    }
  }
}

async function testMemoryEfficiency(page) {
  console.log('🧠 Testing memory efficiency');
  
  const initialMemory = await page.evaluate(() => {
    if (!window.microBench || !window.microBench.getMemorySnapshot) {
      console.log('microBench not available');
      return 0;
    }
    const snapshot = window.microBench.getMemorySnapshot();
    return snapshot ? snapshot.used : 0;
  });
  
  if (initialMemory === 0) {
    console.log('⚠️ Memory API not available');
    return;
  }
  
  // Perform state-heavy operations
  const operations = [
    async () => {
      // Simulate data loading
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        await buttons.first().click();
        await page.waitForTimeout(100);
      }
    },
    
    async () => {
      // Simulate form interaction
      const inputs = page.locator('input');
      if (await inputs.count() > 0) {
        await inputs.first().fill('memory-test-data');
        await page.waitForTimeout(100);
      }
    },
    
    async () => {
      // Simulate navigation
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }
  ];
  
  let totalMemoryDelta = 0;
  let operationCount = 0;
  
  for (const operation of operations) {
    try {
      const beforeOp = await page.evaluate(() => {
        if (!window.microBench?.getMemorySnapshot) return 0;
        const snapshot = window.microBench.getMemorySnapshot();
        return snapshot ? snapshot.used : 0;
      });
      
      await operation();
      
      const afterOp = await page.evaluate(() => {
        if (!window.microBench?.getMemorySnapshot) return 0;
        const snapshot = window.microBench.getMemorySnapshot();
        return snapshot ? snapshot.used : 0;
      });
      
      const memoryDelta = afterOp - beforeOp;
      totalMemoryDelta += Math.abs(memoryDelta);
      operationCount++;
      
      console.log(`Operation ${operationCount} memory delta: ${Math.round(memoryDelta / 1024)}KB`);
      
    } catch (e) {
      console.log(`Memory test operation failed: ${e.message}`);
    }
  }
  
  if (operationCount > 0) {
    const avgMemoryPerOp = totalMemoryDelta / operationCount;
    console.log(`Average memory per operation: ${Math.round(avgMemoryPerOp / 1024)}KB`);
    memoryEfficiency.add(avgMemoryPerOp);
  }
}

async function testSubscriptionOverhead(page) {
  console.log('🔗 Testing subscription overhead');
  
  // This is a simplified test - in a real app you'd hook into your actual observables
  const subscriptionTests = [];
  
  for (let i = 0; i < 5; i++) {
    try {
      const overhead = await page.evaluate(() => {
        window.microBench.start('subscription-test');
        
        // Simulate subscription creation
        const startTime = performance.now();
        
        // Simulate observable subscription overhead
        const observers = [];
        for (let j = 0; j < 10; j++) {
          observers.push({
            id: j,
            callback: () => {},
            created: performance.now()
          });
        }
        
        const endTime = performance.now();
        return endTime - startTime;
      });
      
      subscriptionTests.push(overhead);
      console.log(`Subscription test ${i}: ${Math.round(overhead)}ms`);
      
    } catch (e) {
      console.log(`Subscription test ${i} failed: ${e.message}`);
    }
  }
  
  if (subscriptionTests.length > 0) {
    const avgOverhead = subscriptionTests.reduce((a, b) => a + b) / subscriptionTests.length;
    console.log(`Average subscription overhead: ${Math.round(avgOverhead)}ms`);
    subscriptionOverhead.add(avgOverhead);
  }
}

async function testStateConsistency(page) {
  console.log('🎯 Testing state consistency');
  
  let consistencyIssues = 0;
  
  // Test 1: Multiple rapid state changes
  try {
    const inputs = page.locator('input[type="text"], input[type="search"]');
    if (await inputs.count() > 0) {
      const input = inputs.first();
      
      // Rapid typing to test state consistency
      const testString = 'consistency-test';
      for (const char of testString) {
        await input.type(char, { delay: 10 });
      }
      
      await page.waitForTimeout(100);
      
      // Check if final value matches expected
      const finalValue = await input.inputValue();
      if (finalValue !== testString) {
        console.log(`⚠️ State consistency issue: expected "${testString}", got "${finalValue}"`);
        consistencyIssues++;
      }
    }
  } catch (e) {
    console.log(`State consistency test failed: ${e.message}`);
    consistencyIssues++;
  }
  
  // Test 2: Navigation state consistency
  try {
    const currentUrl = page.url();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // URL should remain consistent
    const newUrl = page.url();
    if (currentUrl !== newUrl) {
      console.log(`⚠️ Navigation consistency issue: URL changed from ${currentUrl} to ${newUrl}`);
      consistencyIssues++;
    }
  } catch (e) {
    console.log(`Navigation consistency test failed: ${e.message}`);
    consistencyIssues++;
  }
  
  console.log(`State consistency issues found: ${consistencyIssues}`);
  stateConsistency.add(consistencyIssues);
  
  check(consistencyIssues, {
    'no_consistency_issues': (issues) => issues === 0,
    'minimal_consistency_issues': (issues) => issues < 2,
  });
}