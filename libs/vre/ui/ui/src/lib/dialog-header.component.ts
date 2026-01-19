import { Component, Input } from '@angular/core';
import { MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-header',
  template: `
    <h2 matDialogTitle>{{ title }}</h2>
    <p>{{ subtitle }}</p>
  `,
  imports: [MatDialogTitle],
})
export class DialogHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
