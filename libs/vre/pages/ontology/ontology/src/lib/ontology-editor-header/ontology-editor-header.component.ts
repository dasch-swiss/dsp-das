import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReadOntology } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { OntologyFormComponent } from '../ontology-form/ontology-form.component';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  selector: 'app-ontology-editor-header',
  templateUrl: './ontology-editor-header.component.html',
  styleUrls: ['./ontology-editor-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyEditorHeaderComponent {
  ontology$ = this._oes.currentOntologyInfo$;
  currentOntologyCanBeDeleted$ = this._oes.currentOntologyCanBeDeleted$;
  project$ = this._store.select(ProjectsSelectors.currentProject);
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  constructor(
    private _dialog: MatDialog,
    private _oes: OntologyEditService,
    private _router: Router,
    private _store: Store
  ) {}

  editOntology(ontology: ReadOntology) {
    this._dialog.open<OntologyFormComponent, ReadOntology>(
      OntologyFormComponent,
      DspDialogConfig.dialogDrawerConfig(ontology, true)
    );
  }

  deleteOntology(ontologyId: string) {
    this._oes
      .deleteOntology$(ontologyId)
      .pipe(take(1))
      .subscribe(delResponse => {
        this.navigateToDataModels();
      });
  }
  navigateToDataModels() {
    const projectUuid = this._store.selectSnapshot(ProjectsSelectors.currentProjectsUuid);
    this._router.navigate([RouteConstants.project, projectUuid, RouteConstants.dataModels]);
  }
}
