import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-interval-value',
  template: `
    <app-time-input label="Start" [control]="control.controls.start" data-cy="start-input" />
    <app-time-input label="End" [control]="control.controls.end" data-cy="end-input" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntervalValueComponent {
  @Input({ required: true }) control!: FormGroup<{ start: FormControl<number>; end: FormControl<number> }>;
}
