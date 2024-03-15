import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-time-value-2',
  template: ' <app-time-input #timeInput [formControl]="control"></app-time-input> ',
})
export class TimeValue2Component {
  @Input() control: FormControl<{ date: any; time: any }>;
}
