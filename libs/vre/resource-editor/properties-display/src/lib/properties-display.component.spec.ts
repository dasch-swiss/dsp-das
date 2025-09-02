import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import {
  PropertiesDisplayComponent,
  PropertiesToolbarComponent,
} from '@dasch-swiss/vre/resource-editor/properties-display';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import {
  PropertyRowComponent,
  PropertyValueComponent,
  PropertyValueDisplayComponent,
  PropertyValuesComponent,
  PropertyValuesWithFootnotesComponent,
  PropertyValueUpdateComponent,
} from '@dasch-swiss/vre/resource-editor/resource-properties';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { of } from 'rxjs';
import { TemplateViewerSwitcherComponent } from 'template-switcher';
import mockResource from './mock-resource';

describe('PropertiesDisplay Integration Test', () => {
  const mockResourceFetcherService = {
    attachedUser$: of({ username: 'testuser', givenName: 'Test', familyName: 'User' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
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
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ResourceFetcherService, useValue: mockResourceFetcherService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should render resource with properties correctly', () => {
    const fixture = TestBed.createComponent(PropertiesDisplayComponent);
    const component = fixture.componentInstance;

    // Set required inputs
    component.resource = mockResource;
    component.displayLabel = true;
    component.parentResourceId = 'test-parent-id';

    // Trigger change detection
    fixture.detectChanges();

    // Test header displays resource label
    const headerElement = fixture.debugElement.nativeElement.querySelector('[data-cy="property-header"]');
    expect(headerElement?.textContent?.trim()).toBe(mockResource.res.label);

    // Test properties toolbar is rendered
    const toolbar = fixture.debugElement.nativeElement.querySelector('app-properties-toolbar');
    expect(toolbar).toBeTruthy();

    // Since mockResource has editable properties, property rows should be rendered
    const propertyRows = fixture.debugElement.nativeElement.querySelectorAll('app-property-row');
    expect(propertyRows.length).toBeGreaterThan(0);

    // Test standoff and incoming links components are rendered
    const standoffLinks = fixture.debugElement.nativeElement.querySelector('app-standoff-links-property');
    const incomingLinks = fixture.debugElement.nativeElement.querySelector('app-incoming-links-property');
    expect(standoffLinks).toBeTruthy();
    expect(incomingLinks).toBeTruthy();

    // Test creation info is shown
    const infoBar = fixture.debugElement.nativeElement.querySelector('.infobar');
    expect(infoBar?.textContent).toContain('Created');
  });

  it('should handle resource with no properties', () => {
    const fixture = TestBed.createComponent(PropertiesDisplayComponent);
    const component = fixture.componentInstance;

    // Create resource with no editable properties
    const resourceWithNoProps = new DspResource(mockResource.res);
    resourceWithNoProps.resProps = [];

    component.resource = resourceWithNoProps;
    component.displayLabel = true;

    fixture.detectChanges();

    // Test "no properties" message is shown (includes label from property-row)
    const noPropsMessage = fixture.debugElement.nativeElement.querySelector('app-property-row div');
    expect(noPropsMessage?.textContent?.trim()).toContain('This resource has no defined properties.');

    // Test regular property rows are not rendered
    const editablePropertyRows = fixture.debugElement.nativeElement.querySelectorAll('[data-cy^="row-"]');
    expect(editablePropertyRows.length).toBe(0);
  });

  it('should display creation info when available', () => {
    const fixture = TestBed.createComponent(PropertiesDisplayComponent);
    const component = fixture.componentInstance;

    component.resource = mockResource;
    component.displayLabel = true;

    fixture.detectChanges();

    // Test creation info bar is displayed
    const infoBar = fixture.debugElement.nativeElement.querySelector('.infobar');
    expect(infoBar).toBeTruthy();

    // Test creation date is displayed
    expect(infoBar.textContent).toContain('Created');
    expect(infoBar.textContent).toContain('on');

    // Test user info is displayed (from mock service)
    expect(infoBar.textContent).toContain('testuser');
  });
});
