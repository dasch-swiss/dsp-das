import { Component, Inject, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { filterUndefined } from '@dasch-swiss/vre/shared/app-common';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest, map, switchMap } from 'rxjs';
import { ResourceClassBrowserPageService } from './resource-class-browser-page.service';

@Component({
  selector: 'app-resource-class-browser-page',
  template: ` <app-multiple-viewer-gateway *ngIf="resources$ | async as resources" [resources]="resources" /> `,
  providers: [ResourceClassBrowserPageService],
})
export class ResourceClassBrowserPageComponent implements OnChanges {
  private readonly _project$ = this._store.select(ProjectsSelectors.currentProject).pipe(filterUndefined());

  resources$ = combineLatest([
    this._project$,
    this._route.params,
    this._resourceClassBrowserPageService.pageIndex$,
  ]).pipe(
    switchMap(([project, params, pageIndex]) => {
      const ontoId = `${this._ontologyService.getIriBaseUrl()}/ontology/${project.shortcode}/${params[RouteConstants.ontoParameter]}/v2`;
      const classId = `${ontoId}#${params[RouteConstants.classParameter]}`;

      return this._performGravSearch(this._setGravsearch(classId), pageIndex);
    }),
    map(response => response.resources)
  );

  constructor(
    protected _route: ActivatedRoute,
    private _resourceClassBrowserPageService: ResourceClassBrowserPageService,
    private _ontologyService: OntologyService,
    protected _router: Router,
    protected _store: Store,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  ngOnChanges() {
    this._resourceClassBrowserPageService.updatePageIndex(0);
  }

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

  private _performGravSearch(query: string, index: number) {
    let gravsearch = query;

    gravsearch = gravsearch.substring(0, gravsearch.search('OFFSET'));
    gravsearch = `${gravsearch}OFFSET ${index}`;

    return this._dspApiConnection.v2.search.doExtendedSearch(gravsearch);
  }
}
