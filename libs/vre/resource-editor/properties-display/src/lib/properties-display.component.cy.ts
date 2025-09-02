import { ActivatedRoute } from '@angular/router';
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
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
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

const mockPropertiesDisplayService = {};

describe('PropertiesDisplayComponent', () => {
  const mockResource2: DspResource = {
    resProps: [
      {
        propDef: {
          id: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
          subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
          comment: 'mytext',
          label: 'mytext',
          guiElement: 'http://api.knora.org/ontology/salsah-gui/v2#SimpleText',
          objectType: 'http://api.knora.org/ontology/knora-api/v2#TextValue',
          isLinkProperty: false,
          isLinkValueProperty: false,
          isEditable: true,
          guiAttributes: [],
        },
        guiDef: {
          propertyIndex: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
          cardinality: 1,
          guiOrder: 1,
          isInherited: false,
          propertyDefinition: {
            id: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
            subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
            comment: 'mytext',
            label: 'mytext',
            guiElement: 'http://api.knora.org/ontology/salsah-gui/v2#SimpleText',
            objectType: 'http://api.knora.org/ontology/knora-api/v2#TextValue',
            isLinkProperty: false,
            isLinkValueProperty: false,
            isEditable: true,
            guiAttributes: [],
          },
        },
        values: [
          {
            type: 'http://api.knora.org/ontology/knora-api/v2#TextValue',
            id: 'http://rdfh.ch/0803/Gv4xnN_jSPmPYl5xGLszIQ/values/eTeQgCoCSDeCHQtj8R8jSQ',
            attachedToUser: 'http://rdfh.ch/users/DhB2sQPgTPW8jQaxoKAHGw',
            arkUrl: 'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB/eTeQgCoCSDeCHQtj8R8jSQi',
            versionArkUrl:
              'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB/eTeQgCoCSDeCHQtj8R8jSQi.20250902T075532801397043Z',
            valueCreationDate: '2025-09-02T07:55:32.801397043Z',
            hasPermissions: 'CR knora-admin:ProjectAdmin|M knora-admin:ProjectMember',
            userHasPermission: 'CR',
            uuid: 'eTeQgCoCSDeCHQtj8R8jSQ',
            text: 'yes',
            strval: 'yes',
            property: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
            propertyLabel: 'mytext',
            propertyComment: 'mytext',
          },
        ],
      },
    ],
    res: {
      type: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#myclass',
      id: 'http://rdfh.ch/0803/Gv4xnN_jSPmPYl5xGLszIQ',
      label: 'test',
      attachedToProject: 'http://rdfh.ch/projects/3ABR_2i8QYGSIDvmP9mlEw',
      attachedToUser: 'http://rdfh.ch/users/DhB2sQPgTPW8jQaxoKAHGw',
      hasPermissions: 'CR knora-admin:ProjectAdmin|M knora-admin:ProjectMember',
      userHasPermission: 'CR',
      arkUrl: 'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB',
      versionArkUrl:
        'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB.20250902T075532801397043Z',
      creationDate: '2025-09-02T07:40:31.607653026Z',
      lastModificationDate: '2025-09-02T07:55:32.801397043Z',
      deleteComment: '',
      isDeleted: false,
      properties: {
        'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext': [
          {
            type: 'http://api.knora.org/ontology/knora-api/v2#TextValue',
            id: 'http://rdfh.ch/0803/Gv4xnN_jSPmPYl5xGLszIQ/values/eTeQgCoCSDeCHQtj8R8jSQ',
            attachedToUser: 'http://rdfh.ch/users/DhB2sQPgTPW8jQaxoKAHGw',
            arkUrl: 'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB/eTeQgCoCSDeCHQtj8R8jSQi',
            versionArkUrl:
              'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB/eTeQgCoCSDeCHQtj8R8jSQi.20250902T075532801397043Z',
            valueCreationDate: '2025-09-02T07:55:32.801397043Z',
            hasPermissions: 'CR knora-admin:ProjectAdmin|M knora-admin:ProjectMember',
            userHasPermission: 'CR',
            uuid: 'eTeQgCoCSDeCHQtj8R8jSQ',
            text: 'yes',
            strval: 'yes',
            property: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
            propertyLabel: 'mytext',
            propertyComment: 'mytext',
          },
        ],
      },
      incomingReferences: [],
      outgoingReferences: [],
      resourceClassLabel: 'myclass',
      resourceClassComment: ' myclass',
      entityInfo: {
        classes: {
          'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#myclass': {
            id: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#myclass',
            subClassOf: ['http://api.knora.org/ontology/knora-api/v2#Resource'],
            comment: ' myclass',
            label: 'myclass',
            propertiesList: [
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#arkUrl',
                cardinality: 0,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#arkUrl',
                  subPropertyOf: [],
                  comment: 'Provides the ARK URL of a resource or value.',
                  label: 'ARK URL',
                  objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#attachedToProject',
                cardinality: 0,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#attachedToProject',
                  subPropertyOf: [],
                  comment: 'Connects something to a project',
                  label: 'attached to project',
                  objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#attachedToUser',
                cardinality: 0,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#attachedToUser',
                  subPropertyOf: [],
                  comment: 'Connects something to a user',
                  label: 'attached to user',
                  objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#creationDate',
                cardinality: 0,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#creationDate',
                  subPropertyOf: [],
                  comment: 'Indicates when a resource was created',
                  label: 'creation date',
                  subjectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
                  objectType: 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#deleteComment',
                cardinality: 1,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#deleteComment',
                  subPropertyOf: [],
                  comment: 'A comment explaining why a resource or value was marked as deleted',
                  label: 'delete comment',
                  objectType: 'http://www.w3.org/2001/XMLSchema#string',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#deleteDate',
                cardinality: 1,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#deleteDate',
                  subPropertyOf: [],
                  comment: 'Indicates when a resource or value was deleted',
                  label: 'delete date',
                  objectType: 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#deletedBy',
                cardinality: 1,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#deletedBy',
                  subPropertyOf: [],
                  comment: 'Indicates who deleted a resource or value',
                  label: 'deleted by',
                  objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#hasIncomingLinkValue',
                cardinality: 2,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#hasIncomingLinkValue',
                  subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasLinkToValue'],
                  comment: 'Indicates that this resource referred to by another resource',
                  label: 'has incoming link',
                  subjectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
                  objectType: 'http://api.knora.org/ontology/knora-api/v2#LinkValue',
                  isLinkProperty: false,
                  isLinkValueProperty: true,
                  isEditable: false,
                  guiAttributes: [],
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#hasPermissions',
                cardinality: 0,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#hasPermissions',
                  subPropertyOf: [],
                  label: 'has permissions',
                  objectType: 'http://www.w3.org/2001/XMLSchema#string',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#hasStandoffLinkTo',
                cardinality: 2,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#hasStandoffLinkTo',
                  subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasLinkTo'],
                  comment: 'Represents a link in standoff markup from one resource to another.',
                  label: 'has Standoff Link to',
                  subjectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
                  objectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
                  isLinkProperty: true,
                  isLinkValueProperty: false,
                  isEditable: false,
                  guiAttributes: [],
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#hasStandoffLinkToValue',
                cardinality: 2,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#hasStandoffLinkToValue',
                  subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasLinkToValue'],
                  comment: 'Represents a link in standoff markup from one resource to another.',
                  label: 'has Standoff Link to',
                  subjectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
                  objectType: 'http://api.knora.org/ontology/knora-api/v2#LinkValue',
                  isLinkProperty: false,
                  isLinkValueProperty: true,
                  isEditable: false,
                  guiAttributes: [],
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#isDeleted',
                cardinality: 1,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#isDeleted',
                  subPropertyOf: [],
                  comment: 'Exists and is true if the resource has been deleted',
                  label: 'is deleted',
                  objectType: 'http://www.w3.org/2001/XMLSchema#boolean',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#lastModificationDate',
                cardinality: 1,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#lastModificationDate',
                  subPropertyOf: [],
                  label: 'last modification date',
                  objectType: 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#userHasPermission',
                cardinality: 0,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#userHasPermission',
                  subPropertyOf: [],
                  comment: "Provides the requesting user's maximum permission on a resource or value.",
                  label: 'user has permission',
                  objectType: 'http://www.w3.org/2001/XMLSchema#string',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#versionArkUrl',
                cardinality: 0,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#versionArkUrl',
                  subPropertyOf: [],
                  comment: 'Provides the ARK URL of a particular version of a resource or value.',
                  label: 'version ARK URL',
                  objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
                },
              },
              {
                propertyIndex: 'http://api.knora.org/ontology/knora-api/v2#versionDate',
                cardinality: 1,
                isInherited: true,
                propertyDefinition: {
                  id: 'http://api.knora.org/ontology/knora-api/v2#versionDate',
                  subPropertyOf: [],
                  comment: 'Provides the date of a particular version of a resource.',
                  label: 'version date',
                  objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
                },
              },
              {
                propertyIndex: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
                cardinality: 1,
                guiOrder: 1,
                isInherited: false,
                propertyDefinition: {
                  id: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
                  subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
                  comment: 'mytext',
                  label: 'mytext',
                  guiElement: 'http://api.knora.org/ontology/salsah-gui/v2#SimpleText',
                  objectType: 'http://api.knora.org/ontology/knora-api/v2#TextValue',
                  isLinkProperty: false,
                  isLinkValueProperty: false,
                  isEditable: true,
                  guiAttributes: [],
                },
              },
            ],
            canBeInstantiated: false,
          },
        },
        properties: {
          'http://api.knora.org/ontology/knora-api/v2#arkUrl': {
            id: 'http://api.knora.org/ontology/knora-api/v2#arkUrl',
            subPropertyOf: [],
            comment: 'Provides the ARK URL of a resource or value.',
            label: 'ARK URL',
            objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
          },
          'http://api.knora.org/ontology/knora-api/v2#attachedToProject': {
            id: 'http://api.knora.org/ontology/knora-api/v2#attachedToProject',
            subPropertyOf: [],
            comment: 'Connects something to a project',
            label: 'attached to project',
            objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
          },
          'http://api.knora.org/ontology/knora-api/v2#attachedToUser': {
            id: 'http://api.knora.org/ontology/knora-api/v2#attachedToUser',
            subPropertyOf: [],
            comment: 'Connects something to a user',
            label: 'attached to user',
            objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
          },
          'http://api.knora.org/ontology/knora-api/v2#creationDate': {
            id: 'http://api.knora.org/ontology/knora-api/v2#creationDate',
            subPropertyOf: [],
            comment: 'Indicates when a resource was created',
            label: 'creation date',
            subjectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
            objectType: 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
          },
          'http://api.knora.org/ontology/knora-api/v2#deleteComment': {
            id: 'http://api.knora.org/ontology/knora-api/v2#deleteComment',
            subPropertyOf: [],
            comment: 'A comment explaining why a resource or value was marked as deleted',
            label: 'delete comment',
            objectType: 'http://www.w3.org/2001/XMLSchema#string',
          },
          'http://api.knora.org/ontology/knora-api/v2#deleteDate': {
            id: 'http://api.knora.org/ontology/knora-api/v2#deleteDate',
            subPropertyOf: [],
            comment: 'Indicates when a resource or value was deleted',
            label: 'delete date',
            objectType: 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
          },
          'http://api.knora.org/ontology/knora-api/v2#deletedBy': {
            id: 'http://api.knora.org/ontology/knora-api/v2#deletedBy',
            subPropertyOf: [],
            comment: 'Indicates who deleted a resource or value',
            label: 'deleted by',
            objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
          },
          'http://api.knora.org/ontology/knora-api/v2#hasIncomingLinkValue': {
            id: 'http://api.knora.org/ontology/knora-api/v2#hasIncomingLinkValue',
            subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasLinkToValue'],
            comment: 'Indicates that this resource referred to by another resource',
            label: 'has incoming link',
            subjectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
            objectType: 'http://api.knora.org/ontology/knora-api/v2#LinkValue',
            isLinkProperty: false,
            isLinkValueProperty: true,
            isEditable: false,
            guiAttributes: [],
          },
          'http://api.knora.org/ontology/knora-api/v2#hasPermissions': {
            id: 'http://api.knora.org/ontology/knora-api/v2#hasPermissions',
            subPropertyOf: [],
            label: 'has permissions',
            objectType: 'http://www.w3.org/2001/XMLSchema#string',
          },
          'http://api.knora.org/ontology/knora-api/v2#hasStandoffLinkTo': {
            id: 'http://api.knora.org/ontology/knora-api/v2#hasStandoffLinkTo',
            subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasLinkTo'],
            comment: 'Represents a link in standoff markup from one resource to another.',
            label: 'has Standoff Link to',
            subjectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
            objectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
            isLinkProperty: true,
            isLinkValueProperty: false,
            isEditable: false,
            guiAttributes: [],
          },
          'http://api.knora.org/ontology/knora-api/v2#hasStandoffLinkToValue': {
            id: 'http://api.knora.org/ontology/knora-api/v2#hasStandoffLinkToValue',
            subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasLinkToValue'],
            comment: 'Represents a link in standoff markup from one resource to another.',
            label: 'has Standoff Link to',
            subjectType: 'http://api.knora.org/ontology/knora-api/v2#Resource',
            objectType: 'http://api.knora.org/ontology/knora-api/v2#LinkValue',
            isLinkProperty: false,
            isLinkValueProperty: true,
            isEditable: false,
            guiAttributes: [],
          },
          'http://api.knora.org/ontology/knora-api/v2#isDeleted': {
            id: 'http://api.knora.org/ontology/knora-api/v2#isDeleted',
            subPropertyOf: [],
            comment: 'Exists and is true if the resource has been deleted',
            label: 'is deleted',
            objectType: 'http://www.w3.org/2001/XMLSchema#boolean',
          },
          'http://api.knora.org/ontology/knora-api/v2#lastModificationDate': {
            id: 'http://api.knora.org/ontology/knora-api/v2#lastModificationDate',
            subPropertyOf: [],
            label: 'last modification date',
            objectType: 'http://www.w3.org/2001/XMLSchema#dateTimeStamp',
          },
          'http://api.knora.org/ontology/knora-api/v2#userHasPermission': {
            id: 'http://api.knora.org/ontology/knora-api/v2#userHasPermission',
            subPropertyOf: [],
            comment: "Provides the requesting user's maximum permission on a resource or value.",
            label: 'user has permission',
            objectType: 'http://www.w3.org/2001/XMLSchema#string',
          },
          'http://api.knora.org/ontology/knora-api/v2#versionArkUrl': {
            id: 'http://api.knora.org/ontology/knora-api/v2#versionArkUrl',
            subPropertyOf: [],
            comment: 'Provides the ARK URL of a particular version of a resource or value.',
            label: 'version ARK URL',
            objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
          },
          'http://api.knora.org/ontology/knora-api/v2#versionDate': {
            id: 'http://api.knora.org/ontology/knora-api/v2#versionDate',
            subPropertyOf: [],
            comment: 'Provides the date of a particular version of a resource.',
            label: 'version date',
            objectType: 'http://www.w3.org/2001/XMLSchema#anyURI',
          },
          'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext': {
            id: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
            subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
            comment: 'mytext',
            label: 'mytext',
            guiElement: 'http://api.knora.org/ontology/salsah-gui/v2#SimpleText',
            objectType: 'http://api.knora.org/ontology/knora-api/v2#TextValue',
            isLinkProperty: false,
            isLinkValueProperty: false,
            isEditable: true,
            guiAttributes: [],
          },
        },
      },
    },
  };

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
