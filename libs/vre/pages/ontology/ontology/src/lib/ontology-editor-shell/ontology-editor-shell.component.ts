import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { OntologyClassNavigatorComponent } from '../ontology-class-navigator/ontology-class-navigator.component';
import { OntologyClassWorkspaceComponent } from '../ontology-class-workspace/ontology-class-workspace.component';
import { OntologyPropertyLibraryComponent } from '../ontology-property-library/ontology-property-library.component';
import { OntologyEditorViewService } from '../services/ontology-editor-view.service';

/**
 * Three-pane shell for the redesigned ontology editor.
 *
 * Owns `OntologyEditorViewService` via component-scoped providers so that
 * selection, filter, drag, and keyboard-assign state lives for the lifetime
 * of the shell and is torn down on navigation away.
 *
 * The `<as-split [disabled]>` binding follows the Phase 1 spike outcome:
 * while a property card is being dragged, the splitter gutters are disabled
 * so the CDK drag overlay isn't intercepted by `<as-split>`'s gutter logic.
 *
 * Layout: left navigator (25%), center workspace (50%), right library (25%).
 */
@Component({
  selector: 'app-ontology-editor-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AngularSplitModule,
    AsyncPipe,
    OntologyClassNavigatorComponent,
    OntologyClassWorkspaceComponent,
    OntologyPropertyLibraryComponent,
  ],
  providers: [OntologyEditorViewService],
  templateUrl: './ontology-editor-shell.component.html',
})
export class OntologyEditorShellComponent {
  readonly viewService = inject(OntologyEditorViewService);
}
