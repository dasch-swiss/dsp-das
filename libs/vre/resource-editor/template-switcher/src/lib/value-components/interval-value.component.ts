import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-interval-value',
  template: `
    <app-time-input label="Start" [control]="startControl" data-cy="start-input" />
    <app-time-input label="End" [control]="endControl" data-cy="end-input" />
    {{ control.value | json }}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntervalValueComponent implements OnInit {
  @Input({ required: true }) control!: FormControl<{ start: number; end: number } | null>;

  startControl = new FormControl(0);
  endControl = new FormControl(0);

  ngOnInit() {
    let updating = false;

    this.control.valueChanges.pipe(startWith(this.control.value)).subscribe(change => {
      if (updating) {
        return;
      }
      updating = true;

      if (change === null) {
        this.startControl.setValue(null, { emitEvent: false });
        this.endControl.setValue(null, { emitEvent: false });
      } else {
        this.startControl.setValue(change.start, { emitEvent: false });
        this.endControl.setValue(change.end, { emitEvent: false });
      }
      updating = false;
    });
    this.startControl.valueChanges.subscribe(start => {
      if (updating) {
        return;
      }
      updating = true;

      if (start === null) {
        this.control.patchValue(null);
      } else if (this.control.value === null) {
        this.control.patchValue({ start, end: 0 });
      } else {
        this.control.patchValue({ start, end: this.control.value.end });
      }
      updating = false;
    });

    this.endControl.valueChanges.subscribe(end => {
      if (updating) {
        return;
      }
      updating = true;

      console.log('got it ', end);
      if (end === null) {
        this.control.patchValue(null);
      } else if (this.control.value === null) {
        this.control.patchValue({ start: 0, end });
      } else {
        this.control.patchValue({ start: this.control.value.start, end });
      }
      updating = false;
    });
  }
}
