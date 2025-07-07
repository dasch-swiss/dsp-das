import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import {
  DefaultClass,
  DefaultProperties,
  DefaultProperty,
  DefaultResourceClasses,
  PropertyCategory,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { EditPropertyFormDialogComponent } from './forms/property-form/edit-property-form-dialog.component';
import { CreatePropertyDialogData } from './forms/property-form/property-form.type';
import { EditResourceClassDialogComponent } from './forms/resource-class-form/edit-resource-class-dialog.component';

@Component({
  selector: 'app-ontology-sidenav',
  template: `
    <a class="sidenav-link" [routerLink]="['classes']" routerLinkActive="active">Classes</a>
    <button mat-button (click)="expandClasses = !expandClasses">
      <mat-icon>{{ expandClasses ? 'compress' : 'expand' }}</mat-icon>
      {{ expandClasses ? 'Collapse all' : 'Expand all' }}
    </button>
    <button
      [disabled]="!(project$ | async)?.status || (isAdmin$ | async) !== true"
      mat-button
      data-cy="create-class-button"
      [matMenuTriggerFor]="addResClassMenu">
      <mat-icon>add</mat-icon>
      Create new class
    </button>
    <mat-menu #addResClassMenu="matMenu" xPosition="before">
      <button
        [disabled]="!(project$ | async)?.status && (isAdmin$ | async) !== true"
        [attr.data-cy]="type.iri.split('#').pop()"
        mat-menu-item
        *ngFor="let type of defaultClasses; trackBy: trackByDefaultClassFn"
        (click)="openCreateResourceClass(type)">
        <mat-icon>{{ type.icon }}</mat-icon>
        {{ type.label }}
      </button>
    </mat-menu>
    <mat-divider></mat-divider>
    <a class="sidenav-link" mat-list-item [routerLink]="['properties']" routerLinkActive="active">Properties</a>
    <button
      mat-button
      [disabled]="!(project$ | async)?.status || (isAdmin$ | async) !== true"
      [matMenuTriggerFor]="newFromPropType">
      <mat-icon>add</mat-icon>
      Add Property
    </button>
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
            (click)="openCreateNewProperty(ele)">
            <mat-icon>{{ ele.icon }}</mat-icon>
            {{ ele.label }}
          </button>
        </mat-menu>
      </ng-container>
    </mat-menu>
  `,
})
export class OntologySidenavComponent {
  project$ = this._store.select(ProjectsSelectors.currentProject);
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  expandClasses = true;

  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;
  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  constructor(
    private _dialog: MatDialog,
    private _store: Store
  ) {}

  openCreateResourceClass(defaultClass: DefaultClass) {
    this._dialog.open<EditResourceClassDialogComponent, DefaultClass>(
      EditResourceClassDialogComponent,
      DspDialogConfig.dialogDrawerConfig(defaultClass)
    );
  }

  openCreateNewProperty(propType: DefaultProperty) {
    this._dialog.open<EditPropertyFormDialogComponent, CreatePropertyDialogData>(EditPropertyFormDialogComponent, {
      data: { propType },
    });
  }

  trackByPropCategoryFn = (index: number, item: PropertyCategory) => `${index}-${item.group}`;
  trackByDefaultPropertyFn = (index: number, item: DefaultProperty) => `${index}-${item.label}`;
  trackByDefaultClassFn = (index: number, item: DefaultClass) => `${index}-${item.iri}`;
}
