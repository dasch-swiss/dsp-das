import { ActivatedRoute } from '@angular/router';
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
import { mount } from 'cypress/angular';
import { of } from 'rxjs';
import { TemplateViewerSwitcherComponent } from 'template-switcher';
import mockResource from './mock-resource';
import { PropertiesDisplayComponent } from './properties-display.component';
import { PropertiesToolbarComponent } from './properties-toolbar.component';

// Mock services
const mockResourceFetcherService = {
  attachedUser$: of({ username: 'testuser', givenName: 'Test', familyName: 'User' }),
};

describe('PropertiesDisplayComponent', () => {
  beforeEach(() => {
    mount(PropertiesDisplayComponent, {
      componentProperties: {
        resource: mockResource,
      },
      providers: [
        { provide: ResourceFetcherService, useValue: mockResourceFetcherService },
        PropertiesDisplayService,
        PropertyValueService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
            },
          },
        },
      ],
      declarations: [
        PropertiesToolbarComponent,
        PropertyValuesWithFootnotesComponent,
        PropertyRowComponent,
        PropertyValuesComponent,
        PropertyValueComponent,
        PropertyValueDisplayComponent,
        PropertyValueUpdateComponent,
        TemplateViewerSwitcherComponent,
      ],
    });
  });

  it('should mount', () => {
    cy.get('[data-cy="properties-toolbar"]').should('exist');
  });
});
