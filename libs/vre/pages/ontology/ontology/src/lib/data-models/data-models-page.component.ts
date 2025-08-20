import { ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ListNodeInfo, ListResponse, OntologyMetadata, ReadProject } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ListsSelectors, LoadListsInProjectAction } from '@dasch-swiss/vre/core/state';
import { ListInfoFormComponent } from '@dasch-swiss/vre/pages/ontology/list';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest } from 'rxjs';
import { CreateOntologyFormDialogComponent } from '../forms/ontology-form/create-ontology-form-dialog.component';

@Component({
  selector: 'app-data-models-page',
  templateUrl: './data-models-page.component.html',
  styleUrls: ['./data-models-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataModelsPageComponent {
  protected readonly RouteConstants = RouteConstants;

  ontologiesMetadata$ = this._projectPageService.ontologies$;
  hasProjectAdminRights$ = this._projectPageService.hasProjectAdminRights$;
  listsInProject$ = this._store.select(ListsSelectors.listsInProject);

  constructor(
    private _dialog: MatDialog,
    private _projectPageService: ProjectPageService,
    private _viewContainerRef: ViewContainerRef,
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
    const ontoName = OntologyService.getOntologyNameFromIri(id);
    this._router.navigate(
      [RouteConstants.ontology, encodeURIComponent(ontoName), RouteConstants.editor, RouteConstants.classes],
      {
        relativeTo: this._route.parent,
      }
    );
  }

  createNewOntology() {
    this._dialog
      .open<CreateOntologyFormDialogComponent>(CreateOntologyFormDialogComponent, {
        ...DspDialogConfig.dialogDrawerConfig(null, true),
        viewContainerRef: this._viewContainerRef,
      })
      .afterClosed()
      .subscribe(o => {
        if (o) {
          this.navigateToOntology(o.id);
        }
      });
  }

  createNewList() {
    const dialog$ = this._dialog
      .open<ListInfoFormComponent, null>(ListInfoFormComponent, DspDialogConfig.dialogDrawerConfig(null, true))
      .afterClosed();

    combineLatest([dialog$, this._projectPageService.currentProject$]).subscribe(
      ([response, project]: [ListResponse, ReadProject]) => {
        this._store.dispatch(new LoadListsInProjectAction(project.id));
        this.navigateToList(response.list.listinfo.id);
      }
    );
  }
}
