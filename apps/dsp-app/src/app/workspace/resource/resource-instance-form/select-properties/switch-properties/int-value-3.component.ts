import { Component, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-int-value-3',
  template: `<mat-form-field style="width: 100%">
    <input matInput [formControl]="control" type="number" />
  </mat-form-field>`,
})
export class IntValue3Component {
  @Input() control: FormControl<number>;
}
