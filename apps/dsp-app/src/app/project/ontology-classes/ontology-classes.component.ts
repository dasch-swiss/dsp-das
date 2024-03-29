import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ClassDefinition } from '@dasch-swiss/dsp-js';
import { OntologyClassService, SortingService } from '@dasch-swiss/vre/shared/app-helper-services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ontology-classes',
  templateUrl: './ontology-classes.component.html',
  styleUrls: ['./ontology-classes.component.scss'],
})
export class OntologyClassesComponent {
  @Input() resClasses: ClassDefinition[];

  @Input() projectMember: boolean;

  // display only the classes which are not a subClass of Standoff and sort them by label
  get classesToDisplay(): ClassDefinition[] {
    const classesToDisplay = OntologyClassService.GetClassesToDisplay(this.resClasses);
    return this._sortingService.keySortByAlphabetical(classesToDisplay, 'label');
  }

  constructor(private _sortingService: SortingService) {}

  trackByFn = (index: number, item: ClassDefinition) => `${index}-${item.id}`;
}
