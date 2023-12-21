import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StringLiteral } from '@dasch-swiss/dsp-js/src/models/admin/string-literal';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { AppGlobal } from '../../app-global';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent {
  loading = true;
  readProject$ = this._route.paramMap.pipe(
    switchMap(params =>
      this._projectApiService.get(this._projectService.uuidToIri(params.get(RouteConstants.uuidParameter)))
    ),
    map(response => response.project),
    finalize(() => {
      this.loading = false;
    })
  );
  sortedDescriptions$ = this.readProject$.pipe(map(({ description }) => this._sortDescriptionsByLanguage(description)));
  userHasPermission$ = of(true);
  RouteConstants = RouteConstants;

  constructor(
    private _route: ActivatedRoute,
    private _projectService: ProjectService,
    private _projectApiService: ProjectApiService
  ) {}

  private _sortDescriptionsByLanguage(descriptions: StringLiteral[]): StringLiteral[] {
    const languageOrder = AppGlobal.languagesList.map(l => l.language);

    return descriptions.sort((a, b) => {
      const indexA = languageOrder.indexOf(a.language);
      const indexB = languageOrder.indexOf(b.language);

      return indexA - indexB;
    });
  }
}
