import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-boolean-value',
  template: `
    <app-nullable-editor [control]="control" [defaultValue]="false">
      <mat-slide-toggle
        [formControl]="control"
        data-cy="bool-toggle"
        *ngIf="control.value !== null"
        style="padding: 16px" />
    </app-nullable-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanValueComponent {
  @Input({ required: true }) control!: FormControl<boolean | null>;

  add() {
    this.control.setValue(false);
  }
}
