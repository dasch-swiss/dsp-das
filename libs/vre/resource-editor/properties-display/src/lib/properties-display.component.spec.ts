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

  it('should work with mock resource data', () => {
    const fixture = TestBed.createComponent(PropertiesDisplayComponent);
    const component = fixture.componentInstance;

    // Set the resource from our mock
    component.resource = mockResource;
    fixture.detectChanges();

    // Log the rendered HTML
    console.log(fixture.debugElement.nativeElement.textContent);

    expect(component).toBeTruthy();
    expect(component.resource).toBe(mockResource);
  });
});
