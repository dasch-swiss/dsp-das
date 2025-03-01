import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ListNodeInfo, OntologyMetadata } from '@dasch-swiss/dsp-js';
import { AppConfigService, DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ListsSelectors, OntologiesSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectBase } from '@dasch-swiss/vre/pages/project/project';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Actions, Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { OntologyFormComponent } from '../ontology-form/ontology-form.component';
import { OntologyFormProps } from '../ontology-form/ontology-form.type';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-data-models',
  templateUrl: './data-models.component.html',
  styleUrls: ['./data-models.component.scss'],
})
export class DataModelsComponent extends ProjectBase implements OnInit {
  protected readonly RouteConstants = RouteConstants;

  get ontologiesMetadata$(): Observable<OntologyMetadata[]> {
    const uuid = this._route.parent.snapshot.params.uuid;
    const iri = `${this._appInit.dspAppConfig.iriBase}/projects/${uuid}`;
    if (!uuid) {
      return of({} as OntologyMetadata[]);
    }

    return this._store.select(OntologiesSelectors.projectOntologies).pipe(
      map(ontologies => {
        if (!ontologies || !ontologies[iri]) {
          return [];
        }

        return ontologies[iri].ontologiesMetadata;
      })
    );
  }

  @Select(UserSelectors.isLoggedIn) isLoggedIn$: Observable<boolean>;
  @Select(OntologiesSelectors.isLoading) isLoading$: Observable<boolean>;
  @Select(ListsSelectors.listsInProject) listsInProject$: Observable<ListNodeInfo[]>;

  constructor(
    private _dialog: MatDialog,
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _appInit: AppConfigService,
    protected _store: Store,
    protected _projectService: ProjectService,
    protected _titleService: Title,
    protected _cd: ChangeDetectorRef,
    protected _actions$: Actions
  ) {
    super(_store, _route, _projectService, _titleService, _router, _cd, _actions$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  trackByFn = (index: number, item: ListNodeInfo) => `${index}-${item.id}`;

  trackByOntologyMetaFn = (index: number, item: OntologyMetadata) => `${index}-${item.id}`;

  navigateToList(id: string) {
    if (!this._store.selectSnapshot(UserSelectors.isLoggedIn)) {
      return;
    }

    const listName = id.split('/').pop();
    this._router.navigate([RouteConstants.list, encodeURIComponent(listName)], {
      relativeTo: this._route.parent,
    });
  }

  navigateToOntology(id: string) {
    if (!this._store.selectSnapshot(UserSelectors.isLoggedIn)) {
      return;
    }

    const ontoName = OntologyService.getOntologyName(id);
    this._router.navigate(
      [RouteConstants.ontology, encodeURIComponent(ontoName), RouteConstants.editor, RouteConstants.classes],
      {
        relativeTo: this._route.parent,
      }
    );
  }

  createNewOntology() {
    this._dialog.open<OntologyFormComponent, OntologyFormProps, null>(
      OntologyFormComponent,
      DspDialogConfig.dialogDrawerConfig(
        {
          ontologyIri: null,
          projectIri: this.projectIri,
        },
        true
      )
    );
  }
}
