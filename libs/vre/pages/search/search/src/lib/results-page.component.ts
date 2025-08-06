import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceClassBrowserPageService } from '@dasch-swiss/vre/pages/data-browser';
import { SearchParams } from '@dasch-swiss/vre/shared/app-common-to-move';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-results-page',
  template: ` <app-multiple-viewer-gateway *ngIf="resources" [resources]="resources" /> `,
  providers: [ResourceClassBrowserPageService],
})
export class ResultsPageComponent {
  searchParams!: SearchParams;
  projectUuid!: string;
  resources!: ReadResource[];

  constructor(
    private _route: ActivatedRoute,
    private _titleService: Title,
    private _cd: ChangeDetectorRef,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {
    const parentParams$ = this._route.parent.paramMap;
    const params$ = this._route.paramMap;

    const combinedParams$ = combineLatest([parentParams$, params$]).pipe(
      map(([parentParams, params]) => ({
        parentParams,
        params,
      }))
    );

    combinedParams$.subscribe(data => {
      const parentParams = data.parentParams;
      const params = data.params;

      this.projectUuid = parentParams.get('uuid')!;
      this._handleSearchParams(params);

      this._titleService.setTitle(`Search results for ${this.searchParams.mode} search`);
    });
  }

  private _handleSearchParams(params: Params) {
    const searchQuery = decodeURIComponent(params.get('q'));
    const searchMode = decodeURIComponent(params.get('mode')) === 'fulltext' ? 'fulltext' : 'gravsearch';

    this.searchParams = {
      query: searchQuery,
      mode: searchMode,
    };

    if (this.projectUuid) {
      this.searchParams.projectUuid = this.projectUuid;
    }

    if (params.get('project') && searchMode === 'fulltext') {
      this.searchParams.filter = {
        limitToProject: decodeURIComponent(params.get('project')),
      };
    }
    this.performGravSearch(0);
    console.log('a', this);
  }

  performGravSearch(index: number) {
    /*
    const numberOfAllResults$ = this._dspApiConnection.v2.search.doExtendedSearchCountQuery(this.search.query).pipe(
      map(count => {
        this.numberOfAllResults = count.numberOfResults;
        if (this.numberOfAllResults === 0) {
          this._notification.openSnackBar('No resources to display.');
          this.emitSelectedResources();
          this.resources = [];
          this.loading = false;
          this._cd.markForCheck();
        }

        return count.numberOfResults;
      })
    );

     */

    let gravsearch = this.searchParams.query;
    gravsearch = gravsearch.substring(0, gravsearch.search('OFFSET'));
    gravsearch = `${gravsearch}OFFSET ${index}`;

    this._dspApiConnection.v2.search.doExtendedSearch(gravsearch).subscribe(response => {
      this.resources = response.resources;
      this._cd.markForCheck();
    });
  }
}
