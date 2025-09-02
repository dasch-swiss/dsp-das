// Create a real ReadResource from DSP-JS
import {
  Constants,
  ReadResource,
  ReadTextValueAsString,
  ResourceClassAndPropertyDefinitions,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspResource, PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';

const readResource = new ReadResource();
readResource.id = 'http://rdfh.ch/0803/Gv4xnN_jSPmPYl5xGLszIQ';
readResource.type = 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#myclass';
readResource.label = 'test';
readResource.attachedToProject = 'http://rdfh.ch/projects/3ABR_2i8QYGSIDvmP9mlEw';
readResource.attachedToUser = 'http://rdfh.ch/users/DhB2sQPgTPW8jQaxoKAHGw';
readResource.hasPermissions = 'CR knora-admin:ProjectAdmin|M knora-admin:ProjectMember';
readResource.userHasPermission = 'CR';
readResource.arkUrl = 'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB';
readResource.versionArkUrl =
  'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB.20250902T075532801397043Z';
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
textValue.versionArkUrl =
  'https://ark.stage.dasch.swiss/ark:/72163/1/0803/Gv4xnN_jSPmPYl5xGLszIQB/eTeQgCoCSDeCHQtj8R8jSQi.20250902T075532801397043Z';
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
  'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext': [textValue],
};

// Create entity info with basic structure (mock for now)
readResource.entityInfo = {} as ResourceClassAndPropertyDefinitions;

// Create a real DspResource
const mockResource = new DspResource(readResource);

// Create PropertyInfoValues for resProps - simplified property definition
const propertyDef: ResourcePropertyDefinition = {
  id: 'http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#mytext',
  subPropertyOf: [Constants.HasValue],
  comment: 'mytext',
  label: 'mytext',
  objectType: Constants.TextValue,
  isLinkProperty: false,
  isLinkValueProperty: false,
  isEditable: true,
  guiAttributes: [],
};

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

mockResource.resProps = [propertyInfoValue];
export default mockResource;
