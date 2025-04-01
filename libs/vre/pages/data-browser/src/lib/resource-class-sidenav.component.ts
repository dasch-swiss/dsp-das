import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ClassDefinition } from '@dasch-swiss/dsp-js';
import { OntologyClassHelper, SortingService } from 'libs/vre/shared/app-helper-services/src';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-class-sidenav',
  template: `
    <div *ngFor="let class of classesToDisplay; trackBy: trackByFn">
      <app-resource-class-sidenav-item [resClass]="class" />
    </div>
  `,
})
export class ResourceClassSidenavComponent {
  @Input({ required: true }) resClasses!: ClassDefinition[];

  get classesToDisplay(): ClassDefinition[] {
    const classesToDisplay = OntologyClassHelper.GetClassesToDisplay(this.resClasses);
    return this._sortingService.keySortByAlphabetical(classesToDisplay, 'label');
  }

  constructor(private _sortingService: SortingService) {}

  trackByFn = (index: number, item: ClassDefinition) => `${index}-${item.id}`;
}
