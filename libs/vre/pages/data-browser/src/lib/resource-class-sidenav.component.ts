import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ClassDefinition, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { LocalizationService, OntologyClassHelper, SortingService } from '@dasch-swiss/vre/shared/app-helper-services';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-class-sidenav',
  template: `
    <div *ngFor="let classToDisplay of classesToDisplay; trackBy: trackByFn">
      <app-resource-class-sidenav-item [resClass]="classToDisplay" />
    </div>
  `,
})
export class ResourceClassSidenavComponent {
  @Input({ required: true }) resClasses!: ResourceClassDefinitionWithAllLanguages[];

  get classesToDisplay(): ResourceClassDefinitionWithAllLanguages[] {
    const classesToDisplay = OntologyClassHelper.GetClassesToDisplay(this.resClasses);
    const language = this._localizationService.getCurrentLanguage();
    return this._sortingService.sortLabelsAlphabetically(classesToDisplay, 'label', language);
  }

  constructor(
    private _localizationService: LocalizationService,
    private _sortingService: SortingService,
  ) {}

  trackByFn = (index: number, item: ClassDefinition) => `${index}-${item.id}`;
}
