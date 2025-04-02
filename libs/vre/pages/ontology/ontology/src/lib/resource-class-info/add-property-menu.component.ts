import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassDefinition, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { OntologiesSelectors, OntologyProperties, PropToAdd, PropToDisplay } from '@dasch-swiss/vre/core/state';
import {
  DefaultProperties,
  DefaultProperty,
  OntologyService,
  PropertyCategory,
  PropertyInfoObject,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  selector: 'app-add-property-menu',
  template: `
    <mat-list style="border-top: 1px solid rgba(0, 0, 0, .12);">
      <mat-list-item
        *ngIf="!disabled"
        class="property link"
        data-cy="add-property-button"
        [matMenuTriggerFor]="addPropertyMenu">
        <mat-icon matListItemIcon class="list-icon">add</mat-icon>
        <span matListItemTitle>Add property</span>
      </mat-list-item>
    </mat-list>

    <mat-menu #addPropertyMenu="matMenu" xPosition="after">
      <button data-cy="create-new-from-type-button" mat-menu-item [matMenuTriggerFor]="newFromPropType">
        Create new from type
      </button>
      <button
        data-cy="add-existing-property-button"
        mat-menu-item
        [matMenuTriggerFor]="addExistingProp"
        *ngIf="resourceClass">
        Add existing property
      </button>
    </mat-menu>

    <mat-menu #addExistingProp="matMenu" class="default-nested-sub-menu">
      <ng-container *ngFor="let onto of availableProperties$ | async; trackBy: trackByPropToAddFn">
        <button mat-menu-item [disabled]="!onto.properties.length" [matMenuTriggerFor]="sub_menu">
          {{ onto.ontologyLabel }}
        </button>
        <mat-menu #sub_menu="matMenu" class="default-nested-sub-menu">
          <button
            mat-menu-item
            *ngFor="let prop of onto.properties; trackBy: trackByPropFn"
            [matTooltip]="prop.propDef.comment"
            matTooltipPosition="after"
            (click)="assignExistingProperty(prop.propDef?.id)">
            <mat-icon>{{ prop.propType?.icon }}</mat-icon>
            {{ prop.propDef.label }}
          </button>
        </mat-menu>
      </ng-container>
    </mat-menu>

    <mat-menu #newFromPropType="matMenu">
      <ng-container *ngFor="let type of defaultProperties; trackBy: trackByPropCategoryFn">
        <button mat-menu-item [matMenuTriggerFor]="sub_menu" [attr.data-cy]="type.group">{{ type.group }}</button>
        <mat-menu #sub_menu="matMenu" class="default-nested-sub-menu">
          <button
            mat-menu-item
            *ngFor="let ele of type.elements; trackBy: trackByDefaultPropertyFn"
            [value]="ele"
            [attr.data-cy]="ele.label"
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
  styles: [
    `
      .property:hover {
        background: #d7e1e9;
        cursor: pointer;
      }
    `,
  ],
})
export class AddPropertyMenuComponent {
  @Input() resourceClass: ClassDefinition | undefined = undefined;
  @Input() disabled = false;
  @Output() updatePropertyAssignment = new EventEmitter<string>();

  private ngUnsubscribe = new Subject<void>();
  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  availableProperties$: Observable<PropToAdd[]> = combineLatest([
    this._store.select(OntologiesSelectors.currentProjectOntologies),
    this._store.select(OntologiesSelectors.currentProjectOntologyProperties),
  ]).pipe(
    takeUntil(this.ngUnsubscribe),
    map(([ontologies, properties]) => {
      return ontologies.map(onto => {
        const classProps = [...(this.resourceClass?.propertiesList || [])];
        const unusedProperties = properties
          .filter(p => p.ontology === onto.id)
          .flatMap(o => o.properties)
          .filter(p => !classProps.some(c => c.propertyIndex === p.id));

        return {
          ontologyId: onto.id,
          ontologyLabel: onto.label,
          properties: unusedProperties.map((prop: ResourcePropertyDefinitionWithAllLanguages) => {
            return {
              propType: this._ontoService.getDefaultPropertyType(prop),
              propDef: prop,
            };
          }),
        };
      });
    })
  );

  constructor(
    private _ontoService: OntologyService,
    private _oes: OntologyEditService,
    private _store: Store
  ) {}

  trackByPropToAddFn = (index: number, item: PropToAdd) => `${index}-${item.ontologyId}`;

  trackByPropCategoryFn = (index: number, item: PropertyCategory) => `${index}-${item.group}`;

  trackByDefaultPropertyFn = (index: number, item: DefaultProperty) => `${index}-${item.label}`;

  trackByPropFn = (index: number, item: PropertyInfoObject) => `${index}-${item.propDef?.id}`;

  assignExistingProperty(propertyId: string) {
    this._oes.assignPropertyToClass(propertyId, this.resourceClass!);
  }

  addNewProperty(propType: DefaultProperty) {
    this._oes.openAddNewProperty(propType, this.resourceClass);
  }
}
