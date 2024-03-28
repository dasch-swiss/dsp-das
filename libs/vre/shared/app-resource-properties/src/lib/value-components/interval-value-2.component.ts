import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-interval-value-2',
  template: `
    <app-common-input placeholder="start" [control]="control.controls.start" type="number"></app-common-input>
    <app-common-input placeholder="end" [control]="control.controls.end" type="number"></app-common-input>
  `,
})
export class IntervalValue2Component {
  @Input() control!: FormGroup<{ start: FormControl<number>; end: FormControl<number> }>;
}
