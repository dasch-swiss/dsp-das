import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { secondsToTimeString } from '@dasch-swiss/vre/ui/ui';

@Component({
  selector: 'app-interval-viewer',
  template: `{{ secondsToTimeString(control.value.start) }}{{ ' ' }}- {{ secondsToTimeString(control.value.end) }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntervalViewerComponent {
  @Input({ required: true }) control!: FormGroup<{ start: FormControl<number>; end: FormControl<number> }>;

  secondsToTimeString(value: number) {
    return secondsToTimeString(value);
  }
}
