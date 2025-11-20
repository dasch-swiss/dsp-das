import { Component, Input } from '@angular/core';
import { OntologyAndResourceClasses } from '@dasch-swiss/vre/3rd-party-services/open-api';

@Component({
  selector: 'app-resource-class-sidenav',
  template: `
    @for (classToDisplay of ontology.classesAndCount; track $index) {
      <app-resource-class-sidenav-item
        [count]="classToDisplay.itemCount"
        [label]="classToDisplay.resourceClass.label![0].value"
        [iri]="classToDisplay.resourceClass.iri" />
    }
  `,
  standalone: false,
})
export class ResourceClassSidenavComponent {
  @Input({ required: true }) ontology!: OntologyAndResourceClasses;
}
