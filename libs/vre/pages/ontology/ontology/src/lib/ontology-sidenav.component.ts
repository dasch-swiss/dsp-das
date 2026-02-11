import { AsyncPipe } from '@angular/common';
import { Component, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import {
  DefaultClass,
  DefaultProperties,
  DefaultProperty,
  DefaultResourceClasses,
  PropertyCategory,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslatePipe } from '@ngx-translate/core';
import { EditPropertyFormDialogComponent } from './forms/property-form/edit-property-form-dialog.component';
import { CreatePropertyDialogData } from './forms/property-form/property-form.type';
import { CreateResourceClassDialogComponent } from './forms/resource-class-form/create-resource-class-dialog.component';
import { OntologyPageService } from './ontology-page.service';

@Component({
  selector: 'app-ontology-sidenav',
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      <a
        mat-tab-link
        routerLink="./{{ RouteConstants.classes }}"
        routerLinkActive
        #rla1="routerLinkActive"
        [active]="rla1.isActive">
        {{ 'pages.ontology.sidenav.classes' | translate }}
      </a>
      <a
        mat-tab-link
        routerLink="./{{ RouteConstants.properties }}"
        routerLinkActive
        #rla2="routerLinkActive"
        [active]="rla2.isActive">
        {{ 'pages.ontology.sidenav.properties' | translate }}
      </a>
    </nav>
    <mat-divider />
    <mat-tab-nav-panel #tabPanel>
      @if (rla1.isActive) {
        <mat-action-list>
          <button mat-list-item (click)="ops.toggleExpandClasses()">
            <span class="list-item">
              <mat-icon>{{ (ops.expandClasses$ | async) ? 'compress' : 'expand' }}</mat-icon>
              {{
                (ops.expandClasses$ | async)
                  ? ('pages.ontology.sidenav.collapseAll' | translate)
                  : ('pages.ontology.sidenav.expandAll' | translate)
              }}
            </span>
          </button>
          @if (hasProjectAdminRights$ | async) {
            <button
              mat-list-item
              [disabled]="!(project$ | async)?.status"
              data-cy="create-class-button"
              [matMenuTriggerFor]="addResClassMenu">
              <span class="list-item">
                <mat-icon>add</mat-icon>
                {{ 'pages.ontology.sidenav.createNewClass' | translate }}
              </span>
            </button>
          }
        </mat-action-list>

        <mat-menu #addResClassMenu="matMenu" xPosition="before">
          @for (type of defaultClasses; track trackByDefaultClassFn($index, type)) {
            <button
              [disabled]="!(project$ | async)?.status"
              [attr.data-cy]="type.iri.split('#').pop()"
              mat-menu-item
              (click)="openCreateResourceClass(type)">
              <mat-icon>{{ type.icon }}</mat-icon>
              {{ type.label }}
            </button>
          }
        </mat-menu>
      }

      @if (rla2.isActive) {
        <!-- Properties tab content -->
        @if (hasProjectAdminRights$ | async) {
          <mat-action-list>
            <button
              mat-list-item
              data-cy="create-property-button"
              [disabled]="!(project$ | async)?.status"
              [matMenuTriggerFor]="newFromPropType">
              <span class="list-item">
                <mat-icon>add</mat-icon>
                {{ 'pages.ontology.sidenav.addProperty' | translate }}
              </span>
            </button>
          </mat-action-list>
        }
        <mat-menu #newFromPropType="matMenu">
          @for (type of defaultProperties; track trackByPropCategoryFn($index, type)) {
            <button mat-menu-item [matMenuTriggerFor]="sub_menu" [attr.data-cy]="type.group">
              {{ type.group }}
            </button>
            <mat-menu #sub_menu="matMenu">
              @for (ele of type.elements; track trackByDefaultPropertyFn($index, ele)) {
                <button
                  mat-menu-item
                  [value]="ele"
                  [attr.data-cy]="ele.label"
                  [matTooltip]="ele.description"
                  matTooltipPosition="after"
                  (click)="openCreateNewProperty(ele)">
                  <mat-icon>{{ ele.icon }}</mat-icon>
                  {{ ele.label }}
                </button>
              }
            </mat-menu>
          }
        </mat-menu>
      }
    </mat-tab-nav-panel>
  `,
  styles: [
    `
      .list-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
  imports: [
    AsyncPipe,
    MatDivider,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTabLink,
    MatTabNav,
    MatTabNavPanel,
    MatTooltip,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    MatListItem,
    MatActionList,
  ],
})
export class OntologySidenavComponent {
  project$ = this._projectPageService.currentProject$;
  hasProjectAdminRights$ = this._projectPageService.hasProjectAdminRights$;

  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;
  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  constructor(
    public ops: OntologyPageService,
    private readonly _projectPageService: ProjectPageService,
    private readonly _dialog: MatDialog,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  openCreateResourceClass(defaultClass: DefaultClass) {
    this._dialog.open<CreateResourceClassDialogComponent, DefaultClass>(CreateResourceClassDialogComponent, {
      ...DspDialogConfig.mediumDialog(defaultClass),
      viewContainerRef: this._viewContainerRef,
    });
  }

  openCreateNewProperty(propType: DefaultProperty) {
    this._dialog.open<EditPropertyFormDialogComponent, CreatePropertyDialogData>(EditPropertyFormDialogComponent, {
      data: { propType },
      viewContainerRef: this._viewContainerRef,
    });
  }

  trackByPropCategoryFn = (index: number, item: PropertyCategory) => `${index}-${item.group}`;
  trackByDefaultPropertyFn = (index: number, item: DefaultProperty) => `${index}-${item.label}`;
  trackByDefaultClassFn = (index: number, item: DefaultClass) => `${index}-${item.iri}`;
  protected readonly RouteConstants = RouteConstants;
}
