import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-create-ressource-form',
  template: ` <h3>Create new resource of type: {{ resourceType }}</h3>
    <app-resource-instance-form [resourceClassIri]="resourceClassIri" [projectIri]="projectIri">
    </app-resource-instance-form>`,
})
export class CreateRessourceFormComponent {
  @Input({ required: true }) resourceType: string;
  @Input({ required: true }) resourceClassIri: string;
  @Input({ required: true }) projectIri: string;
}
