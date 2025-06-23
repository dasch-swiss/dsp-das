import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OntologyMetadata, ReadOntology } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { OntologyFormComponent } from '../forms/ontology-form/ontology-form.component';
import { UpdateOntologyData } from '../forms/ontology-form/ontology-form.type';
import { OntologyEditDialogService } from '../services/ontology-edit-dialog.service';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  selector: 'app-ontology-editor-header',
  templateUrl: './ontology-editor-header.component.html',
  styles: `
    .ontology-editor-header {
      margin-top: 0.5em;

      .back-button {
        height: 90%;
        max-width: 0.5rem;
        margin-right: 1em;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;

        .centered-icon {
          margin: 0;
          display: flex;
          justify-content: center;
          align-self: center;
          text-align: center;
        }
      }

      .ontology-info {
        h3,
        p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          padding: 0;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyEditorHeaderComponent {
  ontology$ = this._oes.currentOntologyInfo$;
  currentOntologyCanBeDeleted$ = this._oes.currentOntologyCanBeDeleted$;
  project$ = this._store.select(ProjectsSelectors.currentProject);
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  constructor(
    private _dialog: MatDialog,
    private _oeds: OntologyEditDialogService,
    private _oes: OntologyEditService,
    private _router: Router,
    private _store: Store
  ) {}

  editOntology(ontology: ReadOntology | OntologyMetadata) {
    const data: UpdateOntologyData = {
      id: ontology.id,
      label: ontology.label,
      comment: ontology.comment || '',
    };
    this._dialog.open<OntologyFormComponent, UpdateOntologyData>(
      OntologyFormComponent,
      DspDialogConfig.dialogDrawerConfig(data, true)
    );
  }

  deleteOntology(ontologyId: string) {
    this._oeds
      .openDeleteOntology$(ontologyId)
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
