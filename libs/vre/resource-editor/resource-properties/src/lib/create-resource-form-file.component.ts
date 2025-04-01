import { Component, Input } from '@angular/core';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { FileRepresentationType } from '@dasch-swiss/vre/resource-editor/representations';
import { Store } from '@ngxs/store';
import { CreateResourceFormInterface } from './create-resource-form.interface';

@Component({
  selector: 'app-create-resource-form-file',
  template: `
    <app-create-resource-form-representation
      [control]="(control?.controls)!.link"
      [fileRepresentation]="fileRepresentation" />

    <app-create-resource-form-legal
      *ngIf="project$ | async as project"
      [formGroup]="control?.controls.legal"
      [projectShortcode]="project.shortcode" />
  `,
})
export class CreateResourceFormFileComponent {
  @Input({ required: true }) control!: CreateResourceFormInterface['file'];
  @Input({ required: true }) fileRepresentation!: FileRepresentationType;

  // TODO remove that useless component

  constructor(private _store: Store) {}

  project$ = this._store.select(ProjectsSelectors.currentProject);
}
