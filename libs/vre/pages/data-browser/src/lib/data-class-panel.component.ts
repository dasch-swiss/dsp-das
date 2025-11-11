import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResourceClassDefinitionWithAllLanguages, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { ResourceFetcherDialogComponent } from '@dasch-swiss/vre/resource-editor/resource-editor';
import { filterUndefined, generateDspResource } from '@dasch-swiss/vre/shared/app-common';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { StringifyStringLiteralPipe } from '@dasch-swiss/vre/ui/string-literal';
import { combineLatest, first } from 'rxjs';
import { CreateResourceDialogComponent, CreateResourceDialogProps } from 'template-switcher';
import { MultipleViewerService } from './comparison/multiple-viewer.service';
import { DataBrowserPageService } from './data-browser-page.service';
import { DownloadDialogComponent } from './download/download-dialog.component';
import { ResourceClassCountApi } from './resource-class-count.api';

@Component({
  selector: 'app-data-class-panel',
  template: `
    <div style="padding-left: 16px; margin-bottom: 32px; padding-right: 16px">
      <div style="display: flex; align-items: center; gap: 8px">
        <h3 style="flex: 1">{{ classSelected.resClass.labels | appStringifyStringLiteral }}</h3>
        <button mat-stroked-button (click)="openDownloadDialog()" data-cy="download-btn">
          <mat-icon>download</mat-icon>
          Download
        </button>
        @if (hasProjectMemberRights$ | async) {
          <button mat-stroked-button (click)="goToAddClassInstance()" data-cy="create-resource-btn">
            {{ 'pages.dataBrowser.dataClassPanel.createResource' | translate }}
          </button>
        }
      </div>
      <p style="font-style: italic">{{ classSelected.resClass.comments | appStringifyStringLiteral }}</p>
    </div>
    <app-resources-list-fetcher [ontologyLabel]="classSelected.ontologyLabel" [classLabel]="classSelected.classLabel" />
  `,
  standalone: false,
  providers: [StringifyStringLiteralPipe],
})
export class DataClassPanelComponent {
  @Input() classSelected!: {
    classLabel: string;
    ontologyLabel: string;
    resClass: ResourceClassDefinitionWithAllLanguages;
  };

  hasProjectMemberRights$ = this._projectPageService.hasProjectMemberRights$;

  constructor(
    private _dialog: MatDialog,
    private _viewContainerRef: ViewContainerRef,
    private _projectPageService: ProjectPageService,
    private readonly _multipleViewerService: MultipleViewerService,
    private _resClassCountApi: ResourceClassCountApi,
    private _stringifyStringLiteralPipe: StringifyStringLiteralPipe,
    private _notificationService: NotificationService,
    private _dataBrowserPageService: DataBrowserPageService
  ) {}

  goToAddClassInstance() {
    this._dialog
      .open<CreateResourceDialogComponent, CreateResourceDialogProps, string>(CreateResourceDialogComponent, {
        ...DspDialogConfig.dialogDrawerConfig(
          {
            resourceType: this._stringifyStringLiteralPipe.transform(this.classSelected.resClass.labels),
            resourceClassIri: this.classSelected.resClass.id,
          },
          true
        ),
        minWidth: 800,
        viewContainerRef: this._viewContainerRef,
      })
      .afterClosed()
      .pipe(filterUndefined())
      .subscribe(resourceIri => {
        this._dataBrowserPageService.reloadNavigation();
        this._dialog.open(ResourceFetcherDialogComponent, {
          ...DspDialogConfig.dialogDrawerConfig({ resourceIri }, true),
          width: `${1200 - this._dialog.openDialogs.length * 40}px`,
        });
      });
  }

  openDownloadDialog() {
    combineLatest([
      this._resClassCountApi.getResourceClassCount(this.classSelected.resClass.id),
      this._multipleViewerService.selectedResources$.pipe(first()),
    ]).subscribe(([resClassCount, resources]) => {
      if (resClassCount === 0 || resources.length === 0) {
        this._notificationService.openSnackBar('There are no resources to download.');
        return;
      }

      console.log(resClassCount);

      const properties = generateDspResource(resources[0]).resProps.filter(
        prop => (prop.propDef as ResourcePropertyDefinition).isEditable
      );

      this._dialog.open(DownloadDialogComponent, {
        ...DspDialogConfig.dialogDrawerConfig(
          { resourceCount: resClassCount, resClass: this.classSelected.resClass, properties },
          true
        ),
        width: '500px',
      });
    });
  }
}
