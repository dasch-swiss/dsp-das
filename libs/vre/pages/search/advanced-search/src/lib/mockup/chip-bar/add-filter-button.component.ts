import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-add-filter-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-mini-fab
      color="primary"
      [class.expanded]="isExpanded"
      (click)="toggleAdd.emit()"
      [matTooltip]="isExpanded ? 'Close' : 'Add filter'">
      <mat-icon>{{ isExpanded ? 'close' : 'add' }}</mat-icon>
    </button>
  `,
  styles: [
    `
      button {
        transition: transform 0.2s ease-out;
      }

      button.expanded {
        transform: rotate(45deg);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFilterButtonComponent {
  @Input() isExpanded = false;
  @Output() toggleAdd = new EventEmitter<void>();
}
