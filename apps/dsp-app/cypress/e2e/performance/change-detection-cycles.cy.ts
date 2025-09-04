import { PerformanceTestBase } from '../../support/utils/performance-test-base';

describe('Change Detection Performance - User Service Refactor', () => {
  const perfTest = new PerformanceTestBase();

  beforeEach(() => {
    perfTest.setupTest();
    cy.visit('/');
  });

  it('should measure change detection cycles during user operations', () => {
    cy.window().then((win) => {
      // Access Angular profiler if available
      const ng = (win as any).ng;
      if (!ng?.profiler) {
        cy.log('Angular profiler not available - skipping detailed CD measurement');
        return;
      }

      // Navigate to user-heavy page (project overview with user permissions)
      cy.visit('/projects');
      
      // Start profiling change detection
      const profileStart = performance.now();
      
      // Trigger user state dependent operations - click on first project
      cy.get('.project-tile').first().click();
      
      // Wait for user permissions to load and UI to stabilize
      cy.get('.project-title').should('be.visible');
      cy.get('[data-cy=user-button]').should('be.visible');
      
      cy.window().then((win) => {
        const profileEnd = performance.now();
        const totalTime = profileEnd - profileStart;
        
        // Record performance data using shared utility
        const measurement = perfTest.recordMeasurement('project_navigation_with_user_permissions', totalTime);
        perfTest.saveMeasurement(measurement, 'cd');
      });
    });
  });

  it('should measure user state change propagation timing', () => {
    // Test rapid user state changes that would trigger many component updates
    cy.visit('/account');
    
    const startTime = performance.now();
    
    // Open user menu (simulates UserService state access)
    cy.get('[data-cy=user-button]').click();
    cy.get('.user-menu').should('be.visible');
    
    // Measure time for all user-dependent components to update
    cy.get('[data-cy=user-button]').should('be.visible'); // Header should update
    cy.get('.menu-header').should('be.visible'); // User info should be displayed
    
    cy.window().then(() => {
      const endTime = performance.now();
      const propagationTime = endTime - startTime;
      
      const measurement = perfTest.recordMeasurement('user_state_propagation', propagationTime);
      perfTest.saveMeasurement(measurement, 'propagation');
    });
  });

  it('should measure memory usage during user operations', () => {
    cy.window().then((win) => {
      // Baseline memory measurement
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform user-intensive operations
      const pages = ['/projects', '/account', '/system/projects'];
      for (let i = 0; i < 3; i++) {
        pages.forEach(page => {
          cy.visit(page);
          cy.wait(300);
        });
      }
      
      cy.window().then(() => {
        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        const measurement = perfTest.recordMeasurement('user_navigation_memory_usage', memoryIncrease, {
          initialMemory,
          finalMemory
        });
        
        perfTest.saveMeasurement(measurement, 'memory');
      });
    });
  });

  afterEach(() => {
    perfTest.cleanup();
  });
});