import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OntologyMetadata, ReadOntology } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { OntologyFormComponent } from '../ontology-form/ontology-form.component';
import { OntologyData } from '../ontology-form/ontology-form.type';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  selector: 'app-ontology-editor-header',
  templateUrl: './ontology-editor-header.component.html',
  styles: `
    .ontology-editor-header {
      margin-top: 0.5em;

      .back-button {
        max-width: 1rem;
        margin-right: 1em;
        display: flex;
        align-items: center;
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
    private _oes: OntologyEditService,
    private _router: Router,
    private _store: Store
  ) {}

  editOntology(ontology: ReadOntology | OntologyMetadata) {
    const data: OntologyData = {
      id: ontology.id,
      label: ontology.label,
      comment: ontology.comment || '',
    };
    this._dialog.open<OntologyFormComponent, OntologyData>(
      OntologyFormComponent,
      DspDialogConfig.dialogDrawerConfig(data, true)
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
