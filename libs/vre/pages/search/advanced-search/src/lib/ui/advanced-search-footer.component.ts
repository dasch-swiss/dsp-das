import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { SearchStateService } from '../service/search-state.service';
import { OrderByComponent } from './order-by/order-by.component';

@Component({
  selector: 'app-advanced-search-footer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, OrderByComponent],
  template: `
    <app-order-by />
    <div class="flex flex-end gap-05em">
      <button mat-button mat-stroked-button color="primary" (click)="handleReset()">Reset</button>
      <button
        mat-button
        mat-raised-button
        color="primary"
        [disabled]="(searchState.isFormStateValid$ | async) === false"
        (click)="searchTriggered.emit()">
        Search
      </button>
    </div>
  `,
  styleUrl: '../advanced-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchFooterComponent {
  @Output() searchTriggered = new EventEmitter<void>();
  @Output() resetTriggered = new EventEmitter<void>();

  searchState = inject(SearchStateService);
  private _dialogService = inject(DialogService);

  handleReset(): void {
    this._dialogService.afterConfirmation('Are you sure you want to reset the form?').subscribe(() => {
      this.resetTriggered.emit();
    });
  }
}
