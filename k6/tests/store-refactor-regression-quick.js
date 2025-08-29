import { browser } from 'k6/browser';
import { HomePage } from '../pages/home-page.js';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Custom metrics for store performance
const stateUpdateLatency = new Trend('state_update_latency');
const memoryGrowth = new Trend('memory_growth');
const bootstrapTime = new Trend('bootstrap_time');

export const options = {
  scenarios: {
    quickRegressionTest: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '3m',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    // Quick regression thresholds
    'state_update_latency': ['avg<1000'], // State updates under 1s
    'memory_growth': ['avg<5242880'], // Memory growth under 5MB  
    'bootstrap_time': ['avg<5000'], // Bootstrap under 5s
    'checks': ['rate>0.8'], // 80% of checks should pass
  },
};

export default async function quickRegressionTest() {
  const page = await browser.newPage();
  const homepage = new HomePage(page);

  try {
    console.log('🔬 Quick Store Regression Test Starting');
    
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
      console.log(`Memory test cycle ${i} failed: ${e.message}`);
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

async function testStateUpdates(page, homepage) {
  await homepage.goto();
  await page.waitForLoadState('networkidle');
  
  const updateTimes = [];
  
  // Test different types of interactions
  const interactions = [
    // Try to click navigation if available
    async () => {
      const navLinks = page.locator('nav a, [routerLink]');
      if (await navLinks.count() > 0) {
        await navLinks.first().click();
        await page.waitForTimeout(500);
        return true;
      }
      return false;
    },
    
    // Try to interact with forms
    async () => {
      const inputs = page.locator('input, select');
      if (await inputs.count() > 0) {
        const input = inputs.first();
        await input.fill('test');
        await page.waitForTimeout(200);
        return true;
      }
      return false;
    },
    
    // Try to click buttons  
    async () => {
      const buttons = page.locator('button, [role="button"]');
      if (await buttons.count() > 0) {
        try {
          await buttons.first().click();
          await page.waitForTimeout(300);
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  ];
  
  for (let i = 0; i < interactions.length; i++) {
    try {
      const startTime = await page.evaluate(() => performance.now());
      
      const interactionSucceeded = await interactions[i]();
      
      if (interactionSucceeded) {
        const endTime = await page.evaluate(() => performance.now());
        const duration = endTime - startTime;
        
        updateTimes.push(duration);
        console.log(`Interaction ${i}: ${Math.round(duration)}ms`);
      } else {
        console.log(`Interaction ${i}: No suitable elements found`);
      }
      
    } catch (e) {
      console.log(`Interaction ${i} failed: ${e.message}`);
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