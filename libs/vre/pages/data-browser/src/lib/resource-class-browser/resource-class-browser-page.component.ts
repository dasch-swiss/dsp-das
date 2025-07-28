import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { filterUndefined } from '@dasch-swiss/vre/shared/app-common';
import { SearchParams } from '@dasch-swiss/vre/shared/app-common-to-move';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-resource-class-browser-page',
  template: ` <app-multiple-viewer *ngIf="searchParams$ | async as searchParams" [searchParams]="searchParams" /> `,
})
export class ResourceClassBrowserPageComponent {
  private readonly _project$ = this._store.select(ProjectsSelectors.currentProject).pipe(filterUndefined());

  searchParams$ = combineLatest([this._project$, this._route.params]).pipe(
    map(([project, params]) => {
      const ontoId = `${this._ontologyService.getIriBaseUrl()}/ontology/${project.shortcode}/${params[RouteConstants.ontoParameter]}/v2`;
      const classId = `${ontoId}#${params[RouteConstants.classParameter]}`;

      return <SearchParams>{
        query: this._setGravsearch(classId),
        mode: 'gravsearch',
      };
    })
  );

  constructor(
    private _acs: AppConfigService,
    protected _route: ActivatedRoute,
    private _ontologyService: OntologyService,
    protected _router: Router,
    protected _store: Store
  ) {}

  private _setGravsearch(iri: string): string {
    return `
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        CONSTRUCT {

        ?mainRes knora-api:isMainResource true .

        } WHERE {

        ?mainRes a knora-api:Resource .
        ?mainRes rdfs:label ?label .


        ?mainRes a <${iri}> .

        }
        ORDER BY ASC(?label)

        OFFSET 0`;
  }
}
