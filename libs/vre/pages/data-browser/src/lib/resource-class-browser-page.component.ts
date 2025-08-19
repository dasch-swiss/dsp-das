import { Component, Inject, OnChanges } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { KnoraApiConnection, ReadProject } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { combineLatest, map, switchMap } from 'rxjs';
import { ResourceResultService } from './resource-result.service';

@Component({
  selector: 'app-resource-class-browser-page',
  template: ` <app-multiple-viewer-gateway *ngIf="resources$ | async as resources" [resources]="resources" /> `,
  providers: [ResourceResultService],
})
export class ResourceClassBrowserPageComponent implements OnChanges {
  resources$ = combineLatest([this._route.params, this._projectPageService.currentProject$]).pipe(
    switchMap(([params, project]) =>
      combineLatest([this._request$(params, project), this.countQuery$(params, project)])
    ),
    map(([resourceResponse, countResponse]) => {
      this._resourceResult.numberOfResults = countResponse.numberOfResults;
      return resourceResponse.resources;
    })
  );

  countQuery$ = (params: Params, project: ReadProject) =>
    this._dspApiConnection.v2.search.doExtendedSearchCountQuery(
      this._setGravsearch(this._getClassIdFromParams(params, project.shortcode))
    );

  constructor(
    protected _route: ActivatedRoute,
    private _resourceResult: ResourceResultService,
    private _ontologyService: OntologyService,
    protected _router: Router,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _projectPageService: ProjectPageService
  ) {}

  ngOnChanges() {
    this._resourceResult.updatePageIndex(0);
  }

  private _request$ = (params: Params, project: ReadProject) =>
    this._resourceResult.pageIndex$.pipe(
      switchMap(pageIndex =>
        this._performGravSearch(this._setGravsearch(this._getClassIdFromParams(params, project.shortcode)), pageIndex)
      )
    );

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

  private _getClassIdFromParams(params: Params, projectShortcode: string) {
    const ontoId = `${this._ontologyService.getIriBaseUrl()}/ontology/${projectShortcode}/${params[RouteConstants.ontoParameter]}/v2`;
    return `${ontoId}#${params[RouteConstants.classParameter]}`;
  }

  private _performGravSearch(query: string, index: number) {
    let gravsearch = query;

    gravsearch = gravsearch.substring(0, gravsearch.search('OFFSET'));
    gravsearch = `${gravsearch}OFFSET ${index}`;

    return this._dspApiConnection.v2.search.doExtendedSearch(gravsearch);
  }
}
