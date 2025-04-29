import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReadOntology } from '@dasch-swiss/dsp-js';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ontology-editor-header',
  templateUrl: './ontology-editor-header.component.html',
  styleUrls: ['./ontology-editor-header.component.scss'],
})
export class OntologyEditorHeaderComponent {
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);
  project$ = this._store.select(ProjectsSelectors.currentProject);
  ontology$ = this._oes.currentOntology$;
  currentOntologyCanBeDeleted$ = this._oes.currentOntologyCanBeDeleted$;
  lastModificationDate$ = this._oes.currentOntology$.pipe(map(x => x?.lastModificationDate));

  constructor(
    private _oes: OntologyEditService,
    private _store: Store
  ) {}

  editOntology(ontology: ReadOntology) {
    this._oes.openEditOntology(ontology);
  }

  deleteOntology() {
    this._oes.deleteCurrentOntology();
  }
}
