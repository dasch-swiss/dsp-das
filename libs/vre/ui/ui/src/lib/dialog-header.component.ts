import { Component, Input } from '@angular/core';
import { MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-header',
  template: `
    <div matDialogTitle>{{ title }}</div>
    <p class="mat-title-small" style="margin-left: 24px">{{ subtitle }}</p>
  `,
  imports: [MatDialogTitle],
})
export class DialogHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
