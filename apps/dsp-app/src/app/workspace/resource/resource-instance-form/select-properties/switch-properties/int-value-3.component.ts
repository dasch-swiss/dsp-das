import { Component, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-int-value-3',
  template: `<mat-form-field style="width: 100%">
    <input matInput [ngModel]="data" (ngModelChange)="dataChange.emit($event)" type="number" />
  </mat-form-field>`,
})
export class IntValue3Component {
  @Input() data: number;
  dataChange = new EventEmitter<number>();
}
