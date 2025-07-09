import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-toggle-value',
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
export class ToggleValueComponent {
  @Input({ required: true }) control!: FormControl<boolean | null>;

  add() {
    this.control.setValue(false);
  }
}
