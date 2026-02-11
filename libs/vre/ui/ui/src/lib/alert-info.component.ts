import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert-info',
  template: ` <div class="restricted-message">
    <mat-icon>report_problem</mat-icon>
    <ng-content />
  </div>`,
  styles: `
    .restricted-message {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 24px;
      border-radius: 20px;
      gap: 10px;
    }
  `,
  imports: [MatIconModule],
})
export class AlertInfoComponent {}
