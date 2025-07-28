import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReadProject, StoredProject } from '@dasch-swiss/dsp-js';
import { AppConfigService, RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  IProjectOntologiesKeyValuePairs,
  OntologiesSelectors,
  ProjectsSelectors,
  UserSelectors,
} from '@dasch-swiss/vre/core/state';
import { SearchParams } from '@dasch-swiss/vre/shared/app-common-to-move';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Actions, Select, Store } from '@ngxs/store';
import { search } from 'effect/String';
import { combineLatest, map, Observable, Subject, takeUntil, takeWhile } from 'rxjs';

@Component({
  selector: 'app-resource-class-browser-page',
  template: `
    <app-multiple-viewer *ngIf="searchParams$ | async as searchParams" [searchParams]="searchParams" />

    <div
      class="single-instance"
      *ngIf="(instanceId$ | async) && (instanceId$ | async) !== routeConstants.addClassInstance">
      <app-resource-fetcher [resourceIri]="resourceIri$ | async" />
    </div>
  `,
})
export class ResourceClassBrowserPageComponent implements OnDestroy {
  @Select(OntologiesSelectors.projectOntologies)
  projectOntologies$: Observable<IProjectOntologiesKeyValuePairs>;
  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
  @Select(UserSelectors.userProjects) userProjects$: Observable<StoredProject[]>;
  @Select(ProjectsSelectors.currentProject) project$!: Observable<ReadProject>;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  get ontoId$(): Observable<string> {
    return combineLatest([this.project$, this._route.params]).pipe(
      takeWhile(([project]) => project !== undefined),
      takeUntil(this.ngUnsubscribe),
      map(([project, params]) => {
        const iriBase = this._ontologyService.getIriBaseUrl();
        const ontologyName = params[RouteConstants.ontoParameter];
        // get the resource ids from the route. Do not use the RouteConstants ontology route constant here,
        // because the ontology and class ids are not defined within the apps domain. They are defined by
        // the api and can not be changed generically via route constants.
        return `${iriBase}/ontology/${project.shortcode}/${ontologyName}/v2`;
      })
    );
  }

  // uuid of resource instance
  get instanceId$(): Observable<string> {
    return this._route.params.pipe(
      takeUntil(this.ngUnsubscribe),
      map(params => params[RouteConstants.instanceParameter])
    );
  }

  // id (iri) of resource class
  get classId$(): Observable<string> {
    return combineLatest([this.ontoId$, this._route.params]).pipe(
      takeUntil(this.ngUnsubscribe),
      map(([ontoId, params]) => {
        const className = params[RouteConstants.classParameter];
        return `${ontoId}#${className}`;
      })
    );
  }

  // id (iri) or resource instance
  get resourceIri$(): Observable<string> {
    return combineLatest([this.instanceId$, this.project$]).pipe(
      takeWhile(([project]) => project !== undefined),
      takeUntil(this.ngUnsubscribe),
      map(([instanceId, project]) =>
        instanceId === RouteConstants.addClassInstance
          ? ''
          : `${this._acs.dspAppConfig.iriBase}/${project.shortcode}/${instanceId}`
      )
    );
  }

  get searchParams$(): Observable<SearchParams> {
    return combineLatest([this.classId$, this.instanceId$, this.project$]).pipe(
      takeWhile(([project]) => project !== undefined),
      takeUntil(this.ngUnsubscribe),
      map(([classId, instanceId]) =>
        instanceId
          ? null
          : <SearchParams>{
              query: this._setGravsearch(classId),
              mode: 'gravsearch',
            }
      )
    );
  }

  routeConstants = RouteConstants;

  constructor(
    private _acs: AppConfigService,
    protected _route: ActivatedRoute,
    private _ontologyService: OntologyService,
    protected _projectService: ProjectService,
    protected _router: Router,
    protected _store: Store,
    protected _actions$: Actions
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

  protected readonly search = search;
}
