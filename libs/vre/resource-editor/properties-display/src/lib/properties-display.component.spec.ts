import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import {
  PropertiesDisplayService,
  PropertyRowComponent,
  PropertyValueComponent,
  PropertyValueDisplayComponent,
  PropertyValuesComponent,
  PropertyValueService,
  PropertyValuesWithFootnotesComponent,
  PropertyValueUpdateComponent,
} from '@dasch-swiss/vre/resource-editor/resource-properties';
import { TemplateViewerSwitcherComponent } from 'template-switcher';

import { PropertiesDisplayComponent } from './properties-display.component';
import { PropertiesToolbarComponent } from './properties-toolbar.component';
import mockResource from './mock-resource';

describe('PropertiesDisplayComponent', () => {
  let component: PropertiesDisplayComponent;
  let fixture: ComponentFixture<PropertiesDisplayComponent>;

  // Mock services
  const mockResourceFetcherService = {
    attachedUser$: of({ username: 'testuser', givenName: 'Test', familyName: 'User' }),
  };

  const mockActivatedRoute = {
    snapshot: {
      queryParams: {},
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PropertiesDisplayComponent,
        PropertiesToolbarComponent,
        PropertyValuesWithFootnotesComponent,
        PropertyRowComponent,
        PropertyValuesComponent,
        PropertyValueComponent,
        PropertyValueDisplayComponent,
        PropertyValueUpdateComponent,
        TemplateViewerSwitcherComponent,
      ],
      providers: [
        { provide: ResourceFetcherService, useValue: mockResourceFetcherService },
        PropertiesDisplayService,
        PropertyValueService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertiesDisplayComponent);
    component = fixture.componentInstance;
    
    // Set the resource input property
    component.resource = mockResource;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mount and display properties toolbar', () => {
    // This replicates the Cypress test: cy.get('[data-cy="properties-toolbar"]').should('exist');
    const propertiesToolbar = fixture.debugElement.query(By.css('[data-cy="properties-toolbar"]'));
    expect(propertiesToolbar).toBeTruthy();
  });

  it('should have resource property set', () => {
    expect(component.resource).toBe(mockResource);
    expect(component.resource.res.label).toBe('test');
  });

  it('should display resource properties', () => {
    expect(component.resource.resProps).toBeDefined();
    expect(component.resource.resProps.length).toBeGreaterThan(0);
  });

  it('should have access to attached user via ResourceFetcherService', () => {
    // Verify that the ResourceFetcherService is properly injected and accessible
    const resourceFetcherService = TestBed.inject(ResourceFetcherService);
    resourceFetcherService.attachedUser$.subscribe(user => {
      expect(user.username).toBe('testuser');
      expect(user.givenName).toBe('Test');
      expect(user.familyName).toBe('User');
    });
  });

  it('should initialize PropertiesDisplayService', () => {
    const propertiesDisplayService = TestBed.inject(PropertiesDisplayService);
    expect(propertiesDisplayService).toBeTruthy();
  });

  it('should initialize PropertyValueService', () => {
    const propertyValueService = TestBed.inject(PropertyValueService);
    expect(propertyValueService).toBeTruthy();
  });
});