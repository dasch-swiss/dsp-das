import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ListNodeInfo, OntologyMetadata, ReadOntology } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ListsSelectors, OntologiesSelectors, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { OntologyFormComponent } from '../ontology-form/ontology-form.component';
import { OntologyData } from '../ontology-form/ontology-form.type';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-data-models',
  templateUrl: './data-models.component.html',
  styleUrls: ['./data-models.component.scss'],
})
export class DataModelsComponent {
  protected readonly RouteConstants = RouteConstants;

  ontologiesMetadata$ = this._store.select(OntologiesSelectors.currentProjectOntologyMetadata);

  @Select(UserSelectors.isMemberOfSystemAdminGroup) isAdmin$!: Observable<string[]>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isProjectMember$!: Observable<string[]>;
  @Select(UserSelectors.isLoggedIn) isLoggedIn$: Observable<boolean>;
  @Select(OntologiesSelectors.isLoading) isLoading$: Observable<boolean>;
  @Select(ListsSelectors.listsInProject) listsInProject$: Observable<ListNodeInfo[]>;

  constructor(
    private _dialog: MatDialog,
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _store: Store,
    protected _projectService: ProjectService
  ) {}

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
    const dialogRef = this._dialog.open<OntologyFormComponent>(
      OntologyFormComponent,
      DspDialogConfig.dialogDrawerConfig(null, true)
    );
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(o => this.navigateToOntology(o.id));
  }
}
