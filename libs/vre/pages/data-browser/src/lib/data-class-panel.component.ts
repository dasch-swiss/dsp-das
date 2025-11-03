import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { ResourceFetcherDialogComponent } from '@dasch-swiss/vre/resource-editor/resource-editor';
import { filterUndefined } from '@dasch-swiss/vre/shared/app-common';
import { StringifyStringLiteralPipe } from '@dasch-swiss/vre/ui/string-literal';
import { CreateResourceDialogComponent, CreateResourceDialogProps } from 'template-switcher';
import { DataBrowserPageService } from './data-browser-page.service';
import { DownloadDialogComponent } from './download/download-dialog.component';

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
    private _stringifyStringLiteralPipe: StringifyStringLiteralPipe,
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
    console.log('class', this);

    this._dialog
      .open(DownloadDialogComponent, {
        ...DspDialogConfig.dialogDrawerConfig({ resourceCount: 2, resClass: this.classSelected.resClass }, true),
        width: '500px',
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          console.log('Download initiated:', result);
          // TODO: Implement actual download logic
        }
      });
  }
}
