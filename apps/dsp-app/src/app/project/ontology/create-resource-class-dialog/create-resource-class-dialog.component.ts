import { Component } from '@angular/core';

@Component({
  selector: 'app-create-resource-class-dialog',
  template: ` <app-resource-class-form
    [formData]="{ name: '', label: [], description: [] }"></app-resource-class-form>`,
})
export class CreateResourceClassDialogComponent {
  constructor() {}
}
