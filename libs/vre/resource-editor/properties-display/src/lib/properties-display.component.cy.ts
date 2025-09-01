import { Cardinality, ReadResource, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { mount } from 'cypress/angular';
import { of } from 'rxjs';
import { PropertiesDisplayComponent } from './properties-display.component';

// Mock services
const mockResourceFetcherService = {
  attachedUser$: of({ username: 'testuser', givenName: 'Test', familyName: 'User' }),
};

const mockPropertiesDisplayService = {};

describe('PropertiesDisplayComponent', () => {
  const createMockDspResource = (label = 'Test Resource'): DspResource => {
    const mockReadResource = new ReadResource();
    mockReadResource.label = label;
    mockReadResource.creationDate = new Date('2023-01-01');

    const mockPropDef = new ResourcePropertyDefinition();
    mockPropDef.id = 'test-prop';
    mockPropDef.label = 'Test Property';
    mockPropDef.comment = 'Test comment';
    mockPropDef.isEditable = true;

    const mockProperty: PropertyInfoValues = {
      propDef: mockPropDef,
      guiDef: { cardinality: Cardinality._0_n },
      values: [],
    };

    return {
      res: mockReadResource,
      resProps: [mockProperty],
    } as DspResource;
  };

  beforeEach(() => {
    mount(PropertiesDisplayComponent, {
      componentProperties: {
        resource: createMockDspResource(),
      },
    });
  });

  it('should mount', () => {
    cy.get('[data-cy="properties-toolbar"]').should('exist');
  });
});
