import { ActivatedRoute } from '@angular/router';
import {
  Constants,
  PropertyDefinition,
  ReadResource,
  ReadTextValueAsString,
  ResourceClassAndPropertyDefinitions,
} from '@dasch-swiss/dsp-js';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import {
  PropertiesDisplayService,
  PropertyRowComponent,
  PropertyValueComponent,
  PropertyValueDisplayComponent,
  PropertyValuesComponent,
  PropertyValuesWithFootnotesComponent,
  PropertyValueUpdateComponent,
} from '@dasch-swiss/vre/resource-editor/resource-properties';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { mount } from 'cypress/angular';
import { of } from 'rxjs';
import { TemplateViewerSwitcherComponent } from 'template-switcher';
import { PropertyValueService } from '../../../resource-properties/src/lib/property-value.service';
import { PropertiesDisplayComponent } from './properties-display.component';
import { PropertiesToolbarComponent } from './properties-toolbar.component';

// Mock services
const mockResourceFetcherService = {
  attachedUser$: of({ username: 'testuser', givenName: 'Test', familyName: 'User' }),
};

describe('PropertiesDisplayComponent', () => {
  // Create a real ReadResource from DSP-JS
  const readResource = new ReadResource();
  readResource.id = 'http://rdfh.ch/0803/Gv4xnN_jSPmPYl5xGLszIQ';
  readResource.type = 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#myclass';
  readResource.label = 'test';
  readResource.attachedToProject = 'http://rdfh.ch/projects/3ABR_2i8QYGSIDvmP9mlEw';
  readResource.attachedToUser = 'http://rdfh.ch/users/DhB2sQPgTPW8jQaxoKAHGw';
  readResource.hasPermissions = 'CR knora-admin:ProjectAdmin|M knora-admin:ProjectMember';
  readResource.userHasPermission = 'CR';
  readResource.arkUrl = 'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB';
  readResource.versionArkUrl = 'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB.20250902T075532801397043Z';
  readResource.creationDate = '2025-09-02T07:40:31.607653026Z';
  readResource.lastModificationDate = '2025-09-02T07:55:32.801397043Z';
  readResource.deleteComment = '';
  readResource.isDeleted = false;
  readResource.resourceClassLabel = 'myclass';
  readResource.resourceClassComment = ' myclass';
  readResource.incomingReferences = [];
  readResource.outgoingReferences = [];

  // Create a text value
  const textValue = new ReadTextValueAsString();
  textValue.id = 'http://rdfh.ch/0803/Gv4xnN_jSPmPYl5xGLszIQ/values/eTeQgCoCSDeCHQtj8R8jSQ';
  textValue.type = Constants.TextValue;
  textValue.attachedToUser = 'http://rdfh.ch/users/DhB2sQPgTPW8jQaxoKAHGw';
  textValue.arkUrl = 'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB/eTeQgCoCSDeCHQtj8R8jSQi';
  textValue.versionArkUrl = 'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB/eTeQgCoCSDeCHQtj8R8jSQi.20250902T075532801397043Z';
  textValue.valueCreationDate = '2025-09-02T07:55:32.801397043Z';
  textValue.hasPermissions = 'CR knora-admin:ProjectAdmin|M knora-admin:ProjectMember';
  textValue.userHasPermission = 'CR';
  textValue.uuid = 'eTeQgCoCSDeCHQtj8R8jSQ';
  textValue.text = 'yes';
  textValue.strval = 'yes';
  textValue.property = 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext';
  textValue.propertyLabel = 'mytext';
  textValue.propertyComment = 'mytext';

  // Set properties on the resource
  readResource.properties = {
    'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext': [textValue]
  };

  // Create entity info with basic structure (mock for now)
  readResource.entityInfo = {} as ResourceClassAndPropertyDefinitions;

  // Create a real DspResource
  const mockResource2 = new DspResource(readResource);

  // Create PropertyInfoValues for resProps - simplified property definition
  const propertyDef: PropertyDefinition = {
    id: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
    subPropertyOf: [Constants.HasValue],
    comment: 'mytext',
    label: 'mytext',
    objectType: Constants.TextValue,
  } as PropertyDefinition;

  const propertyInfoValue: PropertyInfoValues = {
    propDef: propertyDef,
    guiDef: {
      propertyIndex: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
      cardinality: 1,
      guiOrder: 1,
      isInherited: false,
      propertyDefinition: propertyDef,
    },
    values: [textValue],
  };

  mockResource2.resProps = [propertyInfoValue];

  beforeEach(() => {
    mount(PropertiesDisplayComponent, {
      componentProperties: {
        resource: mockResource2,
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
