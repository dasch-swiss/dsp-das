import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-date-value-2',
  template: ' <app-date-value-handler #dateInput [formControl]="control"></app-date-value-handler> ',
})
export class DateValue2Component {
  @Input() control: FormControl<any>;
  valueRequiredValidator = true; // TODO set to true by default.
}
