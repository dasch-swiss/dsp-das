import { Component } from '@angular/core';
import { tap } from 'rxjs';
import { ProjectPageService } from '../project-page.service';
import { LicenseCaptionsMapping } from './license-captions-mapping';

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
      <h3 class="mat-body subtitle" style="margin-bottom: 48px">
        Project {{ project.shortcode }} | {{ project.shortname | uppercase }}
      </h3>

      <div [innerHtml]="project.description[0].value" style="max-height: 40px; overflow: hidden"></div>
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

  constructor(private _projectPageService: ProjectPageService) {}
}
