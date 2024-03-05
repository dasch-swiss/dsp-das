import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-boolean-value-2',
  template: ' <mat-slide-toggle [ngModel]="data" (ngModelChange)="dataChange.emit($event)"></mat-slide-toggle>',
})
export class BooleanValue2Component {
  @Input() data: boolean;
  @Output() dataChange = new EventEmitter<boolean>();
}
