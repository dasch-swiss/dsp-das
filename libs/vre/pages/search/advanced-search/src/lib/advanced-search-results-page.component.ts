import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Input, OnChanges } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ResourceBrowserComponent } from '@dasch-swiss/vre/pages/data-browser';
import { ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { CenteredBoxComponent, NoResultsFoundComponent } from '@dasch-swiss/vre/ui/ui';
import { combineLatest, map, Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-advanced-search-results-page',
  imports: [AsyncPipe, MatButton, MatIcon, CenteredBoxComponent, NoResultsFoundComponent, ResourceBrowserComponent],
  template: `
    @if (resources$ | async; as resources) {
      @if (resources.length === 0) {
        <app-centered-box>
          <app-no-results-found [message]="noResultMessage" />
          <a mat-stroked-button (click)="navigate()"><mat-icon>chevron_left</mat-icon>Back to search form</a>
        </app-centered-box>
      } @else {
        <app-resource-browser
          [data]="{ resources: resources, selectFirstResource: true }"
          [showBackToFormButton]="true" />
      }
    }
  `,
  providers: [ResourceResultService],
})
export class AdvancedSearchResultsPageComponent implements OnChanges {
  @Input() query!: string;
  querySubject = new Subject<string>();

  readonly resources$ = this.querySubject.pipe(
    tap(v => console.log('got search QUERY SUBJECT', v)),
    switchMap(query =>
      combineLatest([
        this._resourceResultService.pageIndex$.pipe(
          switchMap(pageNumber => this._performGravSearch(query, pageNumber))
        ),
        this._numberOfAllResults$(query),
      ])
    ),
    map(([resourceResponse, countResponse]) => {
      this._resourceResultService.numberOfResults = countResponse.numberOfResults;
      return resourceResponse.resources;
    })
  );

  readonly noResultMessage = `We couldn't find any resources matching your search criteria. Try adjusting your search parameters.`;

  constructor(
    @Inject(DspApiConnectionToken) private readonly _dspApiConnection: KnoraApiConnection,
    private readonly _resourceResultService: ResourceResultService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _titleService: Title,
    private readonly _cd: ChangeDetectorRef
  ) {
    this._titleService.setTitle(`Advanced search results`);
  }

  ngOnChanges() {
    console.log('in on changes', this);
    this.querySubject.next(this.query);
    this._cd.detectChanges();
  }

  private _performGravSearch(query_: string, index: number) {
    let query = this._getQuery(query_);
    query = `${query}OFFSET ${index}`;

    return this._dspApiConnection.v2.search.doExtendedSearch(query);
  }

  private _getQuery(query: string): any {
    return query.substring(0, query.search('OFFSET'));
  }

  private _numberOfAllResults$ = (query_: string) =>
    this._dspApiConnection.v2.search.doExtendedSearchCountQuery(`${this._getQuery(query_)}OFFSET 0`);

  navigate() {
    const projectUuid = this._route.parent?.snapshot.params['uuid'];
    this._router.navigate([RouteConstants.project, projectUuid, RouteConstants.advancedSearch]);
  }
}
