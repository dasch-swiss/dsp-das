import { Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-progress-spinner',
  template: ` <mat-progress-spinner
    diameter="20"
    strokeWidth="2"
    mode="indeterminate"
    style="width: 24px; height: 24px; color: var(--primary)"></mat-progress-spinner>`,
  standalone: true,
  imports: [MatProgressSpinner],
})
export class ProgressSpinnerComponent {}
