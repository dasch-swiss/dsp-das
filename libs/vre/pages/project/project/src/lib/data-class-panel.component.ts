import { AsyncPipe } from '@angular/common';
import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { filterUndefined } from '@dasch-swiss/vre/shared/app-common';
import { StringifyStringLiteralPipe } from '@dasch-swiss/vre/ui/string-literal';
import { TranslateModule } from '@ngx-translate/core';
import { from, switchMap } from 'rxjs';
import { DataBrowserPageService } from './data-browser-page.service';
import { ProjectPageService } from './project-page.service';
import { ResourcesListFetcherComponent } from './sidenav/resource-class-sidenav/resources-list-fetcher.component';

interface CreateResourceDialogProps {
  resourceType: string;
  resourceClassIri: string;
  projectIri: string;
  projectShortcode: string;
}

@Component({
  selector: 'app-data-class-panel',
  template: `
    <div style="padding-left: 16px; margin-bottom: 32px; padding-right: 16px">
      <div style="display: flex; align-items: center">
        <h3 style="flex: 1">{{ classSelected.resClass.labels | appStringifyStringLiteral }}</h3>
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
  standalone: true,
  imports: [AsyncPipe, MatButton, TranslateModule, StringifyStringLiteralPipe, ResourcesListFetcherComponent],
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
    private readonly _dialog: MatDialog,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _projectPageService: ProjectPageService,
    private readonly _stringifyStringLiteralPipe: StringifyStringLiteralPipe,
    private readonly _dataBrowserPageService: DataBrowserPageService
  ) {}

  goToAddClassInstance() {
    const project = this._projectPageService.currentProject;
    from(import('@dasch-swiss/vre/resource-editor/resource-editor').then(m => m.CreateResourceDialogComponent))
      .pipe(
        switchMap(CreateResourceDialogComponent =>
          this._dialog
            .open<any, CreateResourceDialogProps, string>(CreateResourceDialogComponent, {
              ...DspDialogConfig.dialogDrawerConfig(
                {
                  resourceType: this._stringifyStringLiteralPipe.transform(this.classSelected.resClass.labels),
                  resourceClassIri: this.classSelected.resClass.id,
                  projectIri: project.id,
                  projectShortcode: project.shortcode,
                },
                true
              ),
              width: '70vw',
              viewContainerRef: this._viewContainerRef,
            })
            .afterClosed()
        ),
        filterUndefined(),
        switchMap(resourceIri =>
          from(
            import('@dasch-swiss/vre/resource-editor/resource-editor').then(m => ({
              resourceIri,
              ResourceFetcherDialogComponent: m.ResourceFetcherDialogComponent,
            }))
          )
        )
      )
      .subscribe(({ resourceIri, ResourceFetcherDialogComponent }) => {
        this._dataBrowserPageService.reloadNavigation();
        this._dialog.open(ResourceFetcherDialogComponent, {
          ...DspDialogConfig.dialogDrawerConfig({ resourceIri }, true),
          width: `${1200 - this._dialog.openDialogs.length * 40}px`,
        });
      });
  }
}
