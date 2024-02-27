import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ClassDefinition, Constants, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import {
  DefaultProperties,
  DefaultProperty,
  OntologyService,
  PropertyCategory,
  PropertyInfoObject,
} from '@dasch-swiss/vre/shared/app-helper-services';
import {
  OntologiesSelectors,
  OntologyProperties,
  PropertyAssignment,
  PropToAdd,
  PropToDisplay,
} from '@dasch-swiss/vre/shared/app-state';
import { DialogComponent, DialogEvent } from '@dsp-app/src/app/main/dialog/dialog.component';
import {
  CreatePropertyFormDialogComponent,
  CreatePropertyFormDialogProps,
} from '@dsp-app/src/app/project/ontology/property-form/create-property-form-dialog.component';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-property-menu',
  template: `
    <mat-list>
      <!-- here we have to know if the class has values or not -->
      <mat-list-item
        *ngIf="(lastModificationDate$ | async) && projectStatus && userCanEdit"
        class="property link"
        [matMenuTriggerFor]="addPropertyMenu">
        <mat-icon matListItemIcon class="list-icon">add</mat-icon>
        <span matListItemTitle>Add property</span>
      </mat-list-item>
    </mat-list>

    <mat-menu #addPropertyMenu="matMenu" xPosition="after">
      <button mat-menu-item [matMenuTriggerFor]="newFromPropType">Create new from type</button>
      <button mat-menu-item [matMenuTriggerFor]="addExistingProp">Add existing property</button>
    </mat-menu>

    <mat-menu #addExistingProp="matMenu" class="default-nested-sub-menu">
      <ng-container *ngFor="let onto of existingProperties$ | async; trackBy: trackByPropToAddFn">
        <button mat-menu-item [disabled]="!onto.properties.length" [matMenuTriggerFor]="sub_menu">
          {{ onto.ontologyLabel }}
        </button>
        <mat-menu #sub_menu="matMenu" class="default-nested-sub-menu">
          <button
            mat-menu-item
            *ngFor="let prop of onto.properties; trackBy: trackByPropFn"
            [matTooltip]="prop.propDef.comment"
            matTooltipPosition="after"
            (click)="addExistingProperty(prop)">
            <mat-icon>{{ prop.propType?.icon }}</mat-icon>
            {{ prop.propDef.label }}
          </button>
        </mat-menu>
      </ng-container>
    </mat-menu>

    <mat-menu #newFromPropType="matMenu">
      <ng-container *ngFor="let type of defaultProperties; trackBy: trackByPropCategoryFn">
        <button mat-menu-item [matMenuTriggerFor]="sub_menu">{{ type.group }}</button>
        <mat-menu #sub_menu="matMenu" class="default-nested-sub-menu">
          <button
            mat-menu-item
            *ngFor="let ele of type.elements; trackBy: trackByDefaultPropertyFn"
            [value]="ele"
            [matTooltip]="ele.description"
            matTooltipPosition="after"
            (click)="addNewProperty(ele)">
            <mat-icon>{{ ele.icon }}</mat-icon>
            {{ ele.label }}
          </button>
        </mat-menu>
      </ng-container>
    </mat-menu>
  `,
})
export class AddPropertyMenuComponent {
  @Input() currentOntologyPropertiesToDisplay: PropToDisplay[];
  @Input() resourceClass: ClassDefinition;
  @Input() projectStatus: boolean;
  @Input() userCanEdit: boolean; // is user a project admin or sys admin?

  private ngUnsubscribe = new Subject<void>();
  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  currentOntology$ = this._store.select(OntologiesSelectors.currentOntology);

  lastModificationDate$ = this.currentOntology$.pipe(
    takeUntil(this.ngUnsubscribe),
    map(x => x?.lastModificationDate)
  );
  currentProjectOntologyProperties$ = this._store.select(OntologiesSelectors.currentProjectOntologyProperties);

  // list of existing ontology properties, which are not in this resource class
  existingProperties$ = this.currentProjectOntologyProperties$.pipe(
    takeUntil(this.ngUnsubscribe),
    map(ontoProperties => this.getExistingProperties([...this.resourceClass.propertiesList], [...ontoProperties]))
  );

  constructor(
    private _dialog: MatDialog,
    private _store: Store,
    private _ontoService: OntologyService
  ) {}

  trackByPropToAddFn = (index: number, item: PropToAdd) => `${index}-${item.ontologyId}`;

  trackByPropCategoryFn = (index: number, item: PropertyCategory) => `${index}-${item.group}`;

  trackByDefaultPropertyFn = (index: number, item: DefaultProperty) => `${index}-${item.label}`;

  trackByPropFn = (index: number, item: PropertyInfoObject) => `${index}-${item.propDef?.id}`;

  addExistingProperty(prop: PropertyInfoObject) {
    const propertyAssignment: PropertyAssignment = {
      resClass: this.resourceClass,
      property: {
        propType: prop.propType,
        propDef: prop.propDef,
      },
    };
    this.assignProperty(propertyAssignment, this.currentOntologyPropertiesToDisplay);
  }

  assignProperty(propertyAssignment: PropertyAssignment, currentOntologyPropertiesToDisplay: PropToDisplay[]) {
    if (!propertyAssignment) {
      return;
    }
    const classLabel = propertyAssignment.resClass.label;

    let mode: 'createProperty' | 'editProperty' = 'createProperty';
    let propLabel = `${propertyAssignment.property.propType.group}: ${propertyAssignment.property.propType.label}`;
    let title = `Add new property of type "${propLabel}" to class "${classLabel}"`;
    if (propertyAssignment.property.propDef) {
      // the property already exists. To assign an existing property simply open the dialog in edit mode
      mode = 'editProperty';
      propLabel = propertyAssignment.property.propDef.label;
      title = `Add existing property "${propLabel}" to class "${classLabel}"`;
    }

    const dialogConfig: MatDialogConfig = {
      width: '640px',
      maxHeight: '80vh',
      position: {
        top: '112px',
      },
      data: {
        propInfo: propertyAssignment.property,
        title,
        subtitle: 'Customize property and cardinality',
        mode,
        parentIri: propertyAssignment.resClass.id,
        position: currentOntologyPropertiesToDisplay.length + 1,
      },
    };
    this.openEditDialog(dialogConfig);
  }

  openEditDialog(dialogConfig: MatDialogConfig) {
    const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((event: DialogEvent) => {
      if (event !== DialogEvent.DialogCanceled) {
        // update the view: list of properties in resource class
        // TODO REMOVED this.updatePropertyAssignment.emit(this.ontology.id);
      }
    });
  }

  addNewProperty(propType: DefaultProperty) {
    const ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
    this._dialog.open<CreatePropertyFormDialogComponent, CreatePropertyFormDialogProps>(
      CreatePropertyFormDialogComponent,
      {
        data: {
          ontologyId: ontology.id,
          lastModificationDate: ontology.lastModificationDate,
          propertyInfo: { propType },
          resClassIri: this.resourceClass.id,
        },
      }
    );
  }

  private getExistingProperties(classProps: PropToDisplay[], ontoProperties: OntologyProperties[]): PropToAdd[] {
    if (classProps.length === 0 || ontoProperties.length === 0) {
      return [];
    }

    const existingProperties: PropToAdd[] = [];
    const currentProjectOntologies = this._store.selectSnapshot(OntologiesSelectors.currentProjectOntologies);
    ontoProperties.forEach((op: OntologyProperties, i: number) => {
      const onto = currentProjectOntologies.find(j => j?.id === op.ontology);
      existingProperties.push({
        ontologyId: op.ontology,
        ontologyLabel: onto?.label,
        properties: [],
      });

      op.properties.forEach((availableProp: ResourcePropertyDefinitionWithAllLanguages) => {
        const superProp = this._ontoService.getSuperProperty(availableProp, currentProjectOntologies);
        if (superProp && availableProp.subPropertyOf.indexOf(superProp) === -1) {
          availableProp.subPropertyOf.push(superProp);
        }

        let propType: DefaultProperty;
        // find corresponding default property to have more prop info
        this._ontoService.getDefaultPropType(availableProp).subscribe((prop: DefaultProperty) => {
          propType = prop;
        });

        const propToAdd: PropertyInfoObject = {
          propType,
          propDef: availableProp,
        };

        if (this.isPropertyToAdd(classProps, availableProp)) {
          existingProperties[i].properties.push(propToAdd);
        }
      });
    });

    return existingProperties;
  }

  private isPropertyToAdd(
    classProps: PropToDisplay[],
    availableProp: ResourcePropertyDefinitionWithAllLanguages
  ): boolean {
    return (
      classProps.findIndex(x => x.propertyIndex === availableProp.id) === -1 &&
      ((availableProp.subjectType &&
        !availableProp.subjectType.includes('Standoff') &&
        availableProp.objectType !== Constants.LinkValue) ||
        !availableProp.isLinkValueProperty)
    );
  }
}
