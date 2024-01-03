import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { StringLiteral } from '@dasch-swiss/dsp-js/src/models/admin/string-literal';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { combineLatest, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
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
    tap(() => {
      this.loading = false;
    })
  );
  sortedDescriptions$ = this.readProject$.pipe(map(({ description }) => this._sortDescriptionsByLanguage(description)));
  userHasPermission$ = combineLatest([
    this._store.select(UserSelectors.user),
    this.readProject$,
    this._store.select(UserSelectors.userProjectAdminGroups),
  ]).pipe(
    map(([user, readProject, userProjectGroups]) => {
      if (readProject == null) {
        return false;
      }

      return ProjectService.IsProjectAdminOrSysAdmin(user as ReadUser, userProjectGroups, readProject.id);
    })
  );

  RouteConstants = RouteConstants;

  constructor(
    private _route: ActivatedRoute,
    private _projectService: ProjectService,
    private _projectApiService: ProjectApiService,
    private _store: Store
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
