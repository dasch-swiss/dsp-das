import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { PaginatedApiService } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { Store } from '@ngxs/store';
import { BehaviorSubject, filter, map, shareReplay, switchMap } from 'rxjs';

@Component({
  selector: 'app-legal-settings-licenses',
  template: ` <ng-container *ngIf="project$ | async as project">
    <div *ngIf="recommendedLicenses$ | async as recommendedLicenses" style="margin-bottom: 24px">
      <app-licenses-enabled-table
        *ngIf="recommendedLicenses.length > 0"
        [licenses]="recommendedLicenses"
        [project]="project"
        [label]="'pages.project.legalSettings.recommended' | translate"
        (refresh)="refresh()" />
    </div>

    <ng-container *ngIf="nonRecommendedLicenses$ | async as nonRecommendedLicenses">
      <app-licenses-enabled-table
        *ngIf="nonRecommendedLicenses.length > 0"
        [licenses]="nonRecommendedLicenses"
        [project]="project"
        [label]="'pages.project.legalSettings.notRecommended' | translate"
        (refresh)="refresh()" />
    </ng-container>
  </ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalSettingsLicensesComponent {
  private readonly _reloadSubject = new BehaviorSubject<void>(undefined);

  readonly project$ = this._reloadSubject.asObservable().pipe(
    switchMap(() => this._store.select(ProjectsSelectors.currentProject)),
    filter(project => project !== undefined),
    map(project => project as ReadProject)
  );

  licenses$ = this.project$.pipe(
    switchMap(project => this._paginatedApi.getLicenses(project.shortcode)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  recommendedLicenses$ = this.licenses$.pipe(map(licenses => licenses.filter(license => license.isRecommended)));
  nonRecommendedLicenses$ = this.licenses$.pipe(map(licenses => licenses.filter(license => !license.isRecommended)));

  constructor(
    private _paginatedApi: PaginatedApiService,
    private _store: Store
  ) {}

  refresh() {
    this._reloadSubject.next();
  }
}
