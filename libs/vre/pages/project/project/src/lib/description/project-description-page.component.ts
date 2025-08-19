import { Component } from '@angular/core';
import { StringLiteral } from '@dasch-swiss/dsp-js/src/models/admin/string-literal';
import { AvailableLanguages, RouteConstants } from '@dasch-swiss/vre/core/config';
import { Store } from '@ngxs/store';
import { map, tap } from 'rxjs';
import { ProjectPageService } from '../project-page.service';
import { LicenseCaptionsMapping } from './license-captions-mapping';

@Component({
  selector: 'app-project-description-page',
  templateUrl: './project-description-page.component.html',
  styleUrls: ['./project-description-page.component.scss'],
})
export class ProjectDescriptionPageComponent {
  readonly routeConstants = RouteConstants;

  readProject$ = this._projectPageService.currentProject$.pipe(
    tap(project => {
      this.hasManualLicense = LicenseCaptionsMapping.get(project.shortcode);
    })
  );

  sortedDescriptions$ = this.readProject$.pipe(map(({ description }) => this._sortDescriptionsByLanguage(description)));

  hasProjectAdminRights$ = this._projectPageService.hasProjectAdminRights$;

  hasManualLicense?: string;

  constructor(
    private _store: Store,
    private _projectPageService: ProjectPageService
  ) {}

  private _sortDescriptionsByLanguage(descriptions: StringLiteral[]): StringLiteral[] {
    const languageOrder = AvailableLanguages.map(l => l.language);

    return descriptions.sort((a, b) => {
      const indexA = languageOrder.indexOf(a.language);
      const indexB = languageOrder.indexOf(b.language);

      return indexA - indexB;
    });
  }
}
