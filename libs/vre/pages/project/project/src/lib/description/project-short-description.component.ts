import { Component, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { tap } from 'rxjs';
import { ProjectPageService } from '../project-page.service';
import { LicenseCaptionsMapping } from './license-captions-mapping';
import { ProjectDescriptionPageComponent } from './project-description-page.component';

@Component({
  selector: 'app-project-short-description',
  standalone: false,
  template: `
    @if (readProject$ | async; as project) {
      <div>
        <app-project-image-cover [project]="project" />
        @if (hasManualLicense) {
          <div class="mat-caption">{{ hasManualLicense }}</div>
        }
      </div>
      <h2>{{ project.longname }}</h2>
      <h3 class="mat-body subtitle" style="margin-bottom: 32px">
        Project {{ project.shortcode }} | {{ project.shortname | uppercase }}
      </h3>

      <div [innerHtml]="project.description[0].value" style="max-height: 120px; padding: 16px; overflow: hidden"></div>
      <button mat-stroked-button (click)="readMore()" style="margin: 16px">Read more</button>
    }
  `,
})
export class ProjectShortDescriptionComponent {
  hasManualLicense?: string;
  readProject$ = this._projectPageService.currentProject$.pipe(
    tap(project => {
      this.hasManualLicense = LicenseCaptionsMapping.get(project.shortcode);
    })
  );

  constructor(
    private _projectPageService: ProjectPageService,
    private _dialog: MatDialog,
    private _viewContainerRef: ViewContainerRef
  ) {}

  readMore() {
    this._dialog.open(ProjectDescriptionPageComponent, {
      ...DspDialogConfig.dialogDrawerConfig({}, true),
      viewContainerRef: this._viewContainerRef,
    });
  }
}
