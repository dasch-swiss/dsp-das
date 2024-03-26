import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-interval-value-2',
  template: '<app-interval-input #intervalInput [formControl]="control"></app-interval-input>',
})
export class IntervalValue2Component {
  @Input() control!: FormControl<any>;
}
