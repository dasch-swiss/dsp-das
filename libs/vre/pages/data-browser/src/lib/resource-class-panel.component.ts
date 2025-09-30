import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { filterUndefined } from '@dasch-swiss/vre/shared/app-common';
import { of } from 'rxjs';
import { CreateResourceDialogComponent, CreateResourceDialogProps } from 'template-switcher';

@Component({
  selector: 'app-resource-class-panel',
  template: `
    <div style="padding-left: 16px; margin-bottom: 32px; padding-right: 16px">
      <div style="display: flex; align-items: center">
        <h3 style="flex: 1">{{ classSelected.classLabel }}</h3>
        @if (hasProjectMemberRights$ | async) {
          <button mat-stroked-button (click)="goToAddClassInstance()">Create a resource</button>
        }
      </div>
      <p style="font-style: italic">{{ classSelected.resClass.comment }}</p>
    </div>
    <app-resources-list-fetcher
      [ontologyLabel]="classSelected.ontologyLabel"
      [classLabel]="classSelected.classLabel"
      [reload$]="hasRight$" />
  `,
  standalone: false,
})
export class ResourceClassPanelComponent {
  hasRight$ = of(null);
  @Input() classSelected!: {
    classLabel: string;
    ontologyLabel: string;
    resClass: ResourceClassDefinitionWithAllLanguages;
  };

  hasProjectMemberRights$ = this._projectPageService.hasProjectMemberRights$;

  constructor(
    private _dialog: MatDialog,
    private _viewContainerRef: ViewContainerRef,
    private _projectPageService: ProjectPageService
  ) {}
  goToAddClassInstance() {
    this._dialog
      .open<CreateResourceDialogComponent, CreateResourceDialogProps, string>(CreateResourceDialogComponent, {
        ...DspDialogConfig.dialogDrawerConfig(
          {
            resourceType: this.classSelected.resClass.label!,
            resourceClassIri: this.classSelected.resClass.id,
          },
          true
        ),
        minWidth: 800,
        viewContainerRef: this._viewContainerRef,
      })
      .afterClosed()
      .pipe(filterUndefined())
      .subscribe(() => {
        // TODO
        /**
        this._loadData();
        this._reloadSubject.next(null);
          */
      });
  }
}
