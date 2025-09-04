describe('Memory Leak Detection - User Service Refactor', () => {
  const version = Cypress.env('VERSION') || 'unknown';
  let memorySnapshots: any[] = [];

  const takeMemorySnapshot = (label: string): number => {
    const memory = (performance as any).memory?.usedJSHeapSize || 0;
    memorySnapshots.push({
      label,
      memory,
      timestamp: Date.now(),
      version
    });
    cy.log(`Memory Snapshot - ${label}: ${(memory / 1024 / 1024).toFixed(2)}MB`);
    return memory;
  };

  beforeEach(() => {
    // Skip database reset for remote environments (DEV/STAGE)
    const baseUrl = Cypress.config('baseUrl');
    if (baseUrl && (baseUrl.includes('localhost') || baseUrl.includes('0.0.0.0'))) {
      cy.resetDatabase();
    }
    
    cy.loginAdmin();
    memorySnapshots = [];
  });

  it('should detect memory leaks in user subscription patterns', () => {
    cy.visit('/');
    
    const baselineMemory = takeMemorySnapshot('baseline');
    
    // Simulate intensive user-dependent component usage
    // This tests for subscription leaks in components not using AsyncPipe or takeUntil
    
    for (let cycle = 1; cycle <= 10; cycle++) {
      cy.log(`Memory test cycle ${cycle}/10`);
      
      // Navigate to user-heavy pages
      cy.visit('/projects');
      cy.wait(200);
      takeMemorySnapshot(`cycle_${cycle}_projects`);
      
      cy.visit('/account');
      cy.wait(200);
      takeMemorySnapshot(`cycle_${cycle}_account`);
      
      cy.visit('/system/projects');
      cy.wait(200);
      takeMemorySnapshot(`cycle_${cycle}_system_projects`);
      
      // Force garbage collection if available
      cy.window().then((win) => {
        if ((win as any).gc) {
          (win as any).gc();
        }
      });
      
      cy.wait(100);
      takeMemorySnapshot(`cycle_${cycle}_after_gc`);
    }
    
    const finalMemory = takeMemorySnapshot('final');
    
    // Analyze memory growth
    const memoryGrowth = finalMemory - baselineMemory;
    const growthPercentage = ((memoryGrowth / baselineMemory) * 100);
    
    cy.log(`Total memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB (${growthPercentage.toFixed(2)}%)`);
    
    // Save detailed memory analysis
    const analysis = {
      version,
      testType: 'subscription_leak_detection',
      baselineMemory,
      finalMemory,
      memoryGrowth,
      growthPercentage,
      snapshots: memorySnapshots,
      timestamp: new Date().toISOString()
    };
    
    cy.writeFile(`cypress/performance-results/memory-leak-${version}-${Date.now()}.json`, analysis);
    
    // Warning thresholds for comparison (not hard failures)
    if (growthPercentage > 50) {
      cy.log(`⚠️  High memory growth detected: ${growthPercentage.toFixed(2)}%`);
    }
  });

  it('should monitor user authentication memory patterns', () => {
    // Test memory usage during repeated login/logout cycles
    const initialMemory = takeMemorySnapshot('auth_test_start');
    
    for (let authCycle = 1; authCycle <= 5; authCycle++) {
      cy.log(`Auth memory test cycle ${authCycle}/5`);
      
      // Logout
      cy.get('[data-cy=user-button]').click();
      cy.get('.user-menu a').contains('Sign out').click();
      cy.wait(500);
      takeMemorySnapshot(`cycle_${authCycle}_logout`);
      
      // Login again
      cy.loginAdmin();
      cy.visit('/');
      cy.get('[data-cy=user-button]').should('be.visible');
      cy.wait(500);
      takeMemorySnapshot(`cycle_${authCycle}_login`);
    }
    
    const finalAuthMemory = takeMemorySnapshot('auth_test_end');
    const authMemoryGrowth = finalAuthMemory - initialMemory;
    
    const authAnalysis = {
      version,
      testType: 'authentication_memory_patterns',
      initialMemory,
      finalMemory: finalAuthMemory,
      memoryGrowth: authMemoryGrowth,
      snapshots: memorySnapshots,
      timestamp: new Date().toISOString()
    };
    
    cy.writeFile(`cypress/performance-results/auth-memory-${version}-${Date.now()}.json`, authAnalysis);
    
    cy.log(`Auth memory growth: ${(authMemoryGrowth / 1024 / 1024).toFixed(2)}MB`);
  });

  it('should test user service observable subscription cleanup', () => {
    cy.visit('/');
    
    const startMemory = takeMemorySnapshot('observable_test_start');
    
    // Visit pages that heavily use UserService observables
    const userServicePages = [
      '/projects',
      '/account',
      '/system/projects',
      '/system/users'
    ];
    
    // Multiple rounds to detect subscription accumulation
    for (let round = 1; round <= 3; round++) {
      cy.log(`Observable subscription round ${round}/3`);
      
      userServicePages.forEach((page, index) => {
        cy.visit(page);
        cy.wait(300);
        takeMemorySnapshot(`round_${round}_page_${index}_${page.replace(/\//g, '_')}`);
      });
      
      // Return to home and wait for cleanup
      cy.visit('/');
      cy.wait(500);
      takeMemorySnapshot(`round_${round}_cleanup`);
    }
    
    const endMemory = takeMemorySnapshot('observable_test_end');
    const observableMemoryGrowth = endMemory - startMemory;
    
    const observableAnalysis = {
      version,
      testType: 'observable_subscription_cleanup',
      startMemory,
      endMemory,
      memoryGrowth: observableMemoryGrowth,
      pagesVisited: userServicePages,
      snapshots: memorySnapshots,
      timestamp: new Date().toISOString()
    };
    
    cy.writeFile(`cypress/performance-results/observable-memory-${version}-${Date.now()}.json`, observableAnalysis);
  });

  afterEach(() => {
    // Save raw snapshots for detailed analysis
    if (memorySnapshots.length > 0) {
      cy.writeFile(`cypress/performance-results/raw-snapshots-${version}-${Date.now()}.json`, memorySnapshots);
    }
  });
});