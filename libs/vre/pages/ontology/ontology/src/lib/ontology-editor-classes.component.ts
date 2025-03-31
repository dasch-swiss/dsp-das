import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import {
  ClassDefinition,
  Constants,
  PropertyDefinition,
  ReadOntology,
  ResourceClassDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { OntologiesSelectors } from '@dasch-swiss/vre/core/state';
import { SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-ontology-editor-classes',
  template: `<div class="ontology-editor-grid classes drag-drop-stop">
    <app-resource-class-info
      *ngFor="let resClass of ontoClasses$ | async; trackBy: trackByClassDefinitionFn"
      [resourceClass]="resClass" />
  </div>`,
  styles: `
    @use 'config' as *;

    .ontology-editor-grid {
      display: grid;
      grid-template-rows: auto;
      grid-template-columns: repeat(auto-fill, minmax(429px, 1fr));
      grid-gap: 6px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyEditorClassesComponent implements OnInit, OnDestroy {
  @Select(OntologiesSelectors.projectOntology) ontology$!: Observable<ReadOntology>;

  properties$!: Observable<PropertyDefinition[]>;

  destroyed: Subject<void> = new Subject<void>();

  ontoClasses$: Observable<ResourceClassDefinitionWithAllLanguages[]>;

  trackByClassDefinitionFn = (index: number, item: ClassDefinition) => `${index}-${item.id}`;

  constructor(private _sortingService: SortingService) {}

  ngOnInit() {
    this.properties$ = this.ontology$.pipe(
      map(ontology => {
        if (ontology) {
          const props = ontology.getAllPropertyDefinitions();
          return this._sortingService
            .keySortByAlphabetical(props, 'label')
            .filter(
              resProp => resProp.objectType !== Constants.LinkValue && !resProp.subjectType?.includes('Standoff')
            );
        }
        return [];
      })
    );

    this.ontoClasses$ = this.ontology$.pipe(
      map(ontology => {
        if (ontology) {
          return this._initOntoClasses(
            ontology.getClassDefinitionsByType<ResourceClassDefinitionWithAllLanguages>(
              ResourceClassDefinitionWithAllLanguages
            )
          );
        }
        return [];
      })
    );
  }

  private _initOntoClasses(allOntoClasses: ResourceClassDefinitionWithAllLanguages[]) {
    // reset the ontology classes
    const ontoClasses: ResourceClassDefinitionWithAllLanguages[] = [];

    // display only the classes which are not a subClass of Standoff
    allOntoClasses.forEach(resClass => {
      if (resClass.subClassOf.length) {
        const splittedSubClass = resClass.subClassOf[0].split('#');
        if (!splittedSubClass[0].includes(Constants.StandoffOntology) && !splittedSubClass[1].includes('Standoff')) {
          ontoClasses.push(resClass);
        }
      }
    });
    return this._sortingService.keySortByAlphabetical(ontoClasses, 'label');
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
