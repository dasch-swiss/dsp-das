import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { ProjectsSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class ResourceClassIriService {
  project$ = this._store.select(ProjectsSelectors.currentProject);

  ontoId$ = this.project$.pipe(
    filter(project => project !== undefined),
    map(project => {
      const iriBase = this._ontologyService.getIriBaseUrl();
      const ontologyName = this._route.snapshot.params[RouteConstants.ontoParameter];
      return `${iriBase}/ontology/${project.shortcode}/${ontologyName}/v2`;
    })
  );

  resourceClassIri$ = this.ontoId$.pipe(
    map(ontoId => {
      const className = this._route.snapshot.params[RouteConstants.classParameter];
      return `${ontoId}#${className}`;
    })
  );

  constructor(
    private _store: Store,
    private _route: ActivatedRoute,
    private _ontologyService: OntologyService
  ) {}
}
