import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-date-value-2',
  template: '',
})
export class DateValue2Component {
  @Input() control: FormControl;
}
