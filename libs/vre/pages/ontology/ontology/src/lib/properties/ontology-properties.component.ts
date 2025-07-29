import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PropertyDefinition } from '@dasch-swiss/dsp-js';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultProperties, DefaultProperty, PropertyCategory } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { EditPropertyFormDialogComponent } from '../forms/property-form/edit-property-form-dialog.component';
import { CreatePropertyDialogData } from '../forms/property-form/property-form.type';
import { PropertyInfo } from '../ontology.types';
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  selector: 'app-ontology-properties',
  template: `
    <div class="ontology-properties-header sticky-header">
      <div class="search-input-wrapper extra-large">
        <span class="search-icon">
          <mat-icon>filter_list</mat-icon>
        </span>
        <input
          #filterInput
          type="text"
          placeholder="Filter properties ..."
          (input)="onFilterChange(filterInput.value)" />
      </div>
      <button
        *ngIf="isAdmin$ | async"
        mat-button
        data-cy="create-property-button"
        [disabled]="!(project$ | async)?.status"
        [matMenuTriggerFor]="newFromPropType">
        <mat-icon>add</mat-icon>
        Create new Property
      </button>
      <mat-menu #newFromPropType="matMenu">
        <ng-container *ngFor="let type of defaultProperties; trackBy: trackByPropCategoryFn">
          <button mat-menu-item [matMenuTriggerFor]="sub_menu" [attr.data-cy]="type.group">
            {{ type.group }}
          </button>
          <mat-menu #sub_menu="matMenu" class="default-nested-sub-menu">
            <button
              mat-menu-item
              *ngFor="let ele of type.elements; trackBy: trackByDefaultPropertyFn"
              [value]="ele"
              [attr.data-cy]="ele.label"
              [matTooltip]="ele.description"
              matTooltipPosition="after"
              (click)="openCreateNewProperty(ele)">
              <mat-icon>{{ ele.icon }}</mat-icon>
              {{ ele.label }}
            </button>
          </mat-menu>
        </ng-container>
      </mat-menu>
    </div>
    <mat-list class="properties scroll">
      <mat-list-item
        class="property"
        [class.admin]="(isAdmin$ | async) === true"
        *ngFor="let prop of properties$ | async; trackBy: trackByPropertyDefinitionFn">
        <app-property-info [property]="prop" />
      </mat-list-item>
    </mat-list>
  `,
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
    .ontology-properties-header {
      margin-top: 1rem;
      max-width: 100em;
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
    }
    .properties {
      max-width: 100em;

      .property {
        background: white;
        border-radius: 8px;
        height: auto;
        margin: 8px 0;

        &.admin:hover {
          background: var(--element-active-hover);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyPropertiesComponent {
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);
  project$ = this._store.select(ProjectsSelectors.currentProject);

  private _filter$ = new BehaviorSubject<string>('');

  properties$: Observable<PropertyInfo[]> = combineLatest([this._oes.currentOntologyProperties$, this._filter$]).pipe(
    map(([props, filter]) => {
      const f = filter.toLowerCase();
      return props.filter(
        p =>
          p.propDef.labels.some(l => l.value.toLowerCase().includes(f)) ||
          p.propDef.comments.some(l => l.value.toLowerCase().includes(f)) ||
          p.propType?.description?.toLowerCase().includes(f)
      );
    })
  );

  onFilterChange(value: string) {
    this._filter$.next(value);
  }

  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  trackByPropertyDefinitionFn = (index: number, item: PropertyDefinition) => `${index}-${item.id}`;

  constructor(
    private _dialog: MatDialog,
    private _oes: OntologyEditService,
    private _store: Store
  ) {}

  openCreateNewProperty(propType: DefaultProperty) {
    this._dialog.open<EditPropertyFormDialogComponent, CreatePropertyDialogData>(EditPropertyFormDialogComponent, {
      data: { propType },
    });
  }

  trackByPropCategoryFn = (index: number, item: PropertyCategory) => `${index}-${item.group}`;
  trackByDefaultPropertyFn = (index: number, item: DefaultProperty) => `${index}-${item.label}`;
}
