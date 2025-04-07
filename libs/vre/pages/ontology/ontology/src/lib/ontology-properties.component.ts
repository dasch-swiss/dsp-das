import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Constants, PropertyDefinition, ReadOntology } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/3rd-party-services/api';
import { OntologiesSelectors } from '@dasch-swiss/vre/core/state';
import { SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-ontology-properties',
  template: `
    <div class="ontology-editor-list properties">
      <mat-list class="without-padding">
        <mat-list-item
          class="property"
          *ngFor="let prop of properties$ | async; trackBy: trackByPropertyDefinitionFn; let odd = odd"
          [class.odd]="odd">
          <app-property-info [propDef]="prop" />
        </mat-list-item>
      </mat-list>
    </div>
  `,
  styles: `
    @use 'config' as *;
    .ontology-editor-list {
      margin: 16px;

      &.properties {
        width: 80%;
        margin: 16px 10%;

        .property {
          height: auto;
          min-height: 56px !important;
          margin: 4px 0;
          padding: 16px 0;

          &.odd {
            background-color: $primary_50;
          }

          &:hover {
            background-color: $black-14-opacity;
          }
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyPropertiesComponent implements OnInit {
  @Select(OntologiesSelectors.projectOntology) currentOntology$: Observable<ReadOntology>;

  properties$!: Observable<PropertyDefinition[]>;

  trackByPropertyDefinitionFn = (index: number, item: PropertyDefinition) => `${index}-${item.id}`;

  constructor(private _sortingService: SortingService) {}

  ngOnInit() {
    this.properties$ = this.currentOntology$.pipe(
      map(ontology => {
        if (ontology) {
          const props = getAllEntityDefinitionsAsArray(ontology.properties);
          // return sorted array
          return this._sortingService
            .keySortByAlphabetical(props, 'label')
            .filter(
              resProp => resProp.objectType !== Constants.LinkValue && !resProp.subjectType?.includes('Standoff')
            );
        }
        return [];
      })
    );
  }
}
