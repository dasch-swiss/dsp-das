import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-boolean-value-2',
  template: ' <mat-slide-toggle [formControl]="control"></mat-slide-toggle>',
})
export class BooleanValue2Component {
  @Input() control: FormControl<boolean>;
}
