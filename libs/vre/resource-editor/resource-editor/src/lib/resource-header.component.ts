import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResourceClassDefinitionWithPropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { LoadClassItemsCountAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { ResourceUtil } from '@dasch-swiss/vre/resource-editor/representations';
import {
  EditResourceLabelDialogComponent,
  EditResourceLabelDialogProps,
} from '@dasch-swiss/vre/resource-editor/resource-properties';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-resource-header',
  template: ` <div class="resource-header">
    <div class="resource-class-header">
      <h3
        [class.label-info]="resourceClassType?.comment"
        [matTooltip]="resourceClassType?.comment"
        matTooltipClass="header-tooltip"
        matTooltipPosition="above">
        {{ resourceClassType?.label }}<span *ngIf="resource.res.isDeleted">(deleted)</span>
      </h3>
      <app-resource-toolbar
        [resource]="resource"
        [lastModificationDate]="resource.res.lastModificationDate"
        [adminPermissions]="isAdmin$ | async"
        [showEditLabel]="false"
        (afterResourceDeleted)="afterResourceDeleted()" />
    </div>
    <div class="resource-label" style="display: flex; justify-content: space-between">
      <h4 data-cy="resource-header-label">{{ resource.res.label }}</h4>
      <button
        mat-icon-button
        data-cy="edit-label-button"
        color="primary"
        matTooltip="Edit label"
        (click)="openEditLabelDialog()"
        *ngIf="userCanEdit">
        <mat-icon>edit</mat-icon>
      </button>
    </div>
    <app-resource-info-bar [resource]="resource" />
  </div>`,
  styles: [
    `
      .resource-header {
        margin-bottom: 24px;
      }

      .resource-label h4 {
        display: inline-block;
        font-weight: 500;
        font-size: 18px;
        line-height: 22px;
        margin-bottom: 0;
        margin-block-start: 0;
        margin-block-end: 0;
        padding-top: 16px;
      }

      .resource-class-header {
        display: flex;
        box-sizing: border-box;
        flex-direction: row;
        align-items: start;
        justify-content: space-between;

        h3.label-info {
          cursor: help;
        }

        h3 {
          display: inline-block;
          text-transform: uppercase;
          font-size: 16px;
          font-weight: normal;
          letter-spacing: 1.25px;
          margin-block-end: 0em;
        }

        .action {
          display: inline-block;
          white-space: nowrap;

          button {
            border-radius: 0;
          }
        }
      }
    `,
  ],
})
export class ResourceHeaderComponent {
  @Input({ required: true }) resource!: DspResource;

  get resourceClassType(): ResourceClassDefinitionWithPropertyDefinition {
    return this.resource.res.entityInfo.classes[this.resource.res.type];
  }

  get userCanEdit(): boolean {
    return ResourceUtil.userCanEdit(this.resource.res);
  }

  get attachedToProjectResource(): string {
    return this.resource.res.attachedToProject;
  }

  isAdmin$: Observable<boolean> = combineLatest([
    this._store.select(UserSelectors.user),
    this._store.select(UserSelectors.userProjectAdminGroups),
  ]).pipe(
    map(([user, userProjectGroups]) => {
      return this.attachedToProjectResource
        ? ProjectService.IsProjectAdminOrSysAdmin(user!, userProjectGroups, this.attachedToProjectResource)
        : false;
    })
  );

  constructor(
    private _dialog: MatDialog,
    private _store: Store,
    private _viewContainerRef: ViewContainerRef,
    private _ontologyService: OntologyService
  ) {}

  openEditLabelDialog() {
    this._dialog.open<EditResourceLabelDialogComponent, EditResourceLabelDialogProps, boolean>(
      EditResourceLabelDialogComponent,
      {
        ...DspDialogConfig.smallDialog<EditResourceLabelDialogProps>({ resource: this.resource.res }),
        viewContainerRef: this._viewContainerRef,
      }
    );
  }

  afterResourceDeleted() {
    const ontologyIri = this._ontologyService.getOntologyIriFromRoute(
      this._store.selectSnapshot(ProjectsSelectors.currentProject)!.shortcode
    );
    const classId = this.resource.res.entityInfo.classes[this.resource.res.type]?.id;
    this._store.dispatch(new LoadClassItemsCountAction(ontologyIri, classId));
  }
}
