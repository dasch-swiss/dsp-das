import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toggle-value',
  template: `
    <button mat-icon-button (click)="add()" data-cy="add-bool-toggle" *ngIf="control.value === null">
      <mat-icon class="add-icon">add_box</mat-icon>
    </button>
    <div class="nullable-boolean">
      <mat-slide-toggle [formControl]="control" data-cy="bool-toggle" *ngIf="control.value !== null" />
      <button mat-icon-button (click)="cancel()" title="Cancel" *ngIf="control.value !== null">
        <mat-icon>cancel</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .nullable-boolean {
        display: flex;
        align-items: center;

        button {
          margin-left: 20px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleValueComponent {
  @Input({ required: true }) control!: FormControl<boolean | null>;

  add() {
    this.control.patchValue(false);
  }

  cancel() {
    this.control.patchValue(null);
  }
}
