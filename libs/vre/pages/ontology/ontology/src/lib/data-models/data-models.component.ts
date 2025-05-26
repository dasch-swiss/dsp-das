import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ListNodeInfo, ListResponse, OntologyMetadata } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ListsSelectors, OntologiesSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { ListInfoFormComponent } from '@dasch-swiss/vre/pages/ontology/list';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { OntologyFormComponent } from '../ontology-form/ontology-form.component';

@Component({
  selector: 'app-data-models',
  templateUrl: './data-models.component.html',
  styleUrls: ['./data-models.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataModelsComponent {
  protected readonly RouteConstants = RouteConstants;

  ontologiesMetadata$ = this._store.select(OntologiesSelectors.currentProjectOntologyMetadata);
  isAdmin$ = this._store.select(UserSelectors.isMemberOfSystemAdminGroup);
  isLoggedIn$ = this._store.select(UserSelectors.isLoggedIn);
  isLoading$ = this._store.select(OntologiesSelectors.isLoading);
  listsInProject$ = this._store.select(ListsSelectors.listsInProject);

  constructor(
    private _dialog: MatDialog,
    public _route: ActivatedRoute,
    private _router: Router,
    private _store: Store
  ) {}

  trackByFn = (index: number, item: ListNodeInfo) => `${index}-${item.id}`;

  trackByOntologyMetaFn = (index: number, item: OntologyMetadata) => `${index}-${item.id}`;

  navigateToList(id: string) {
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

  createNewList() {
    const dialogRef = this._dialog.open<ListInfoFormComponent, null>(
      ListInfoFormComponent,
      DspDialogConfig.dialogDrawerConfig(null, true)
    );
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((response: ListResponse) => {
        this.navigateToList(response.list.listinfo.id);
      });
  }
}
