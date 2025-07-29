import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClassDefinition } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultClass, DefaultResourceClasses } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { CreateResourceClassDialogComponent } from '../forms/resource-class-form/create-resource-class-dialog.component';
import { OntologyPageService } from '../ontology-page.service';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  selector: 'app-ontology-editor-classes',
  template: ` <div class="ontology-classes-header sticky-header">
      <div class="search-input-wrapper extra-large">
        <span class="search-icon">
          <mat-icon>filter_list</mat-icon>
        </span>
        <input #filterInput type="text" placeholder="Filter classes ..." (input)="onFilterChange(filterInput.value)" />
      </div>
      <div class="right-side-controls">
        <button mat-button (click)="ops.toggleExpandClasses()">
          <mat-icon>{{ (ops.expandClasses$ | async) ? 'compress' : 'expand' }}</mat-icon>
          {{ (ops.expandClasses$ | async) ? 'Collapse all' : 'Expand all' }}
        </button>

        <button
          *ngIf="isAdmin$ | async"
          [disabled]="!(project$ | async)?.status"
          mat-button
          data-cy="create-class-button"
          [matMenuTriggerFor]="addResClassMenu">
          <mat-icon>add</mat-icon>
          Create new class
        </button>

        <mat-menu #addResClassMenu="matMenu" xPosition="before">
          <button
            [disabled]="!(project$ | async)?.status"
            [attr.data-cy]="type.iri.split('#').pop()"
            mat-menu-item
            *ngFor="let type of defaultClasses; trackBy: trackByDefaultClassFn"
            (click)="openCreateResourceClass(type)">
            <mat-icon>{{ type.icon }}</mat-icon>
            {{ type.label }}
          </button>
        </mat-menu>
      </div>
    </div>
    <div class="ontology-editor-grid classes scroll">
      <app-resource-class-info
        *ngFor="let resClass of ontoClasses$ | async; trackBy: trackByClassDefinitionFn"
        [resourceClass]="resClass" />
    </div>`,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%; /* important */
    }
    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .scroll {
      flex: 1 1 auto;
      overflow-y: auto;
      min-height: 0;
    }

    .ontology-classes-header {
      margin-top: 1rem;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .search-input-wrapper {
        width: 30%;
        max-width: 30em;
        display: flex;
        align-items: center;
        border: 1px solid #ccc;
        border-radius: 2rem;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;

        .search-icon {
          margin-right: 0.5rem;
          color: var(--gray-500);
          display: flex;
          align-items: center;
        }

        input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 1rem;
          background: transparent;
        }
      }
      .right-side-controls {
        display: flex;
        flex-direction: row;
      }
    }
    .ontology-editor-grid {
      display: grid;
      grid-template-rows: auto;
      grid-template-columns: repeat(auto-fill, minmax(640px, 1fr));
      grid-gap: 6px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyEditorClassesComponent {
  project$ = this._store.select(ProjectsSelectors.currentProject);
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  private _filter$ = new BehaviorSubject<string>('');
  ontoClasses$ = combineLatest([this._oes.currentOntologyClasses$, this._filter$]).pipe(
    map(([classes, filter]) => {
      const f = filter.toLowerCase();
      return classes.filter(
        c =>
          c.labels.some(label => label.value.toLowerCase().includes(f)) ||
          c.comments.some(comment => comment.value.toLowerCase().includes(f))
      );
    })
  );

  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;

  trackByClassDefinitionFn = (index: number, item: ClassDefinition) => `${index}-${item.id}`;

  constructor(
    private _dialog: MatDialog,
    private _oes: OntologyEditService,
    public ops: OntologyPageService,
    private _store: Store
  ) {}

  onFilterChange(value: string) {
    this._filter$.next(value);
  }

  openCreateResourceClass(defaultClass: DefaultClass) {
    this._dialog.open<CreateResourceClassDialogComponent, DefaultClass>(
      CreateResourceClassDialogComponent,
      DspDialogConfig.mediumDialog(defaultClass)
    );
  }

  trackByDefaultClassFn = (index: number, item: DefaultClass) => `${index}-${item.iri}`;
}
