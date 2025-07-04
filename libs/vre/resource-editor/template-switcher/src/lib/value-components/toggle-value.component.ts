import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toggle-value',
  template: `
    <app-nullable-editor [control]="control" [defaultValue]="false">
      <div class="nullable-boolean">
        <mat-slide-toggle [formControl]="control" data-cy="bool-toggle" *ngIf="control.value !== null" />
      </div>
    </app-nullable-editor>
  `,
  styles: [
    `
      .nullable-boolean {
        display: flex;
        align-items: center;
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
}
