import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ClassDefinition } from '@dasch-swiss/dsp-js';
import { OntologyClassHelper, SortingService } from '@dasch-swiss/vre/shared/app-helper-services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ontology-classes',
  template: `
    <div *ngFor="let class of classesToDisplay; trackBy: trackByFn">
      <app-ontology-class-item [resClass]="class" />
    </div>
  `,
})
export class OntologyClassesComponent {
  @Input({ required: true }) resClasses!: ClassDefinition[];

  get classesToDisplay(): ClassDefinition[] {
    const classesToDisplay = OntologyClassHelper.GetClassesToDisplay(this.resClasses);
    return this._sortingService.keySortByAlphabetical(classesToDisplay, 'label');
  }

  constructor(private _sortingService: SortingService) {}

  trackByFn = (index: number, item: ClassDefinition) => `${index}-${item.id}`;
}
