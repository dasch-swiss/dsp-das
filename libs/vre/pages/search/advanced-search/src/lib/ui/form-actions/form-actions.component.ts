import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropertyFormManager } from '../../service/property-form.manager';
import { SearchStateService } from '../../service/search-state.service';

@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="action-buttons">
      <button mat-button mat-stroked-button color="primary" (click)="emitResetButtonClicked.emit()">Reset</button>
      <button
        mat-button
        mat-raised-button
        color="primary"
        [disabled]="(propertyFormManager.isFormValid$ | async) === false"
        (click)="emitSearchButtonClicked.emit()">
        Search
      </button>
    </div>
  `,
  styleUrls: ['../advanced-search.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormActionsComponent {
  propertyFormManager = inject(PropertyFormManager);

  @Output() emitResetButtonClicked = new EventEmitter<void>();
  @Output() emitSearchButtonClicked = new EventEmitter<void>();
}
