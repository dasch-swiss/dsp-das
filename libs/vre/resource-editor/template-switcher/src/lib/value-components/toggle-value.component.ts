import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toggle-value',
  template: `
    <app-nullable-editor [control]="control" [defaultValue]="false">
      <div class="nullable-boolean">
        <mat-slide-toggle [formControl]="control" data-cy="bool-toggle" *ngIf="control.value !== null" />
        <button mat-icon-button (click)="cancel()" title="Cancel" *ngIf="control.value !== null">
          <mat-icon>cancel</mat-icon>
        </button>
      </div>
    </app-nullable-editor>
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
