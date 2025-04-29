import { CreatePropertyFormDialogComponent } from '@dasch-swiss/vre/ontology/ontology-properties';
import { CreateResourceClassDialogComponent } from './lib/create-resource-class-dialog/create-resource-class-dialog.component';
import { DataModelsComponent } from './lib/data-models/data-models.component';
import { EditResourceClassDialogComponent } from './lib/edit-resource-class-dialog/edit-resource-class-dialog.component';
import { OntologyEditorClassesComponent } from './lib/ontology-editor-classes.component';
import { OntologyEditorHeaderComponent } from './lib/ontology-editor-header/ontology-editor-header.component';
import { OntologyEditorSidenavComponent } from './lib/ontology-editor-sidenav/ontology-editor-sidenav.component';
import { OntologyFormComponent } from './lib/ontology-form/ontology-form.component';
import { OntologyPropertiesComponent } from './lib/ontology-properties.component';
import { OntologyComponent } from './lib/ontology.component';
import { PropertyInfoComponent } from './lib/property-info/property-info.component';
import { ResourceClassFormComponent } from './lib/resource-class-form/resource-class-form.component';
import { AddPropertyMenuComponent } from './lib/resource-class-info/add-property-menu.component';
import { ResourceClassInfoElementComponent } from './lib/resource-class-info/resource-class-info-element.component';
import { ResourceClassInfoComponent } from './lib/resource-class-info/resource-class-info.component';
import { CardinalityChangeDialogComponent } from './lib/resource-class-info/resource-class-property-info/cardinality-component/cardinality-change-dialog.component';
import { CardinalityComponent } from './lib/resource-class-info/resource-class-property-info/cardinality-component/cardinality.component';
import { ResourceClassPropertyInfoComponent } from './lib/resource-class-info/resource-class-property-info/resource-class-property-info.component';

export const OntologyComponents = [
  CreateResourceClassDialogComponent,
  DataModelsComponent,
  EditResourceClassDialogComponent,
  OntologyFormComponent,
  OntologyComponent,
  OntologyEditorHeaderComponent,
  OntologyEditorSidenavComponent,
  OntologyEditorClassesComponent,
  OntologyPropertiesComponent,
  PropertyInfoComponent,
  ResourceClassFormComponent,
  AddPropertyMenuComponent,
  ResourceClassInfoComponent,
  ResourceClassInfoElementComponent,
  ResourceClassPropertyInfoComponent,
  CardinalityComponent,
  CardinalityChangeDialogComponent,
  CreatePropertyFormDialogComponent,
];
