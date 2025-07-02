import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-interval-value',
  template: `
    <app-time-input label="Start" [control]="startControl" data-cy="start-input" />
    <app-time-input label="End" [control]="endControl" data-cy="end-input" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntervalValueComponent {
  @Input({ required: true }) control!: FormControl<{ start: number; end: number } | null>;

  startControl = new FormControl(0);
  endControl = new FormControl(0);
}
