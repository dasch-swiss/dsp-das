import { Component, Input, OnInit } from '@angular/core';
import { Constants, ReadBooleanValue, ReadValue } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-values',
  template: ` <ng-container [ngSwitch]="value.type">
    <ng-container *ngSwitchCase="constants.IntValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.DecimalValue">{{ value.strval }}</ng-container>
    <mat-icon *ngSwitchCase="constants.BooleanValue">{{ booleanValue.bool ? 'toggle_on' : 'toggle_off' }} </mat-icon>
    <ng-container *ngSwitchCase="constants.ColorValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.TextValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.DateValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.TimeValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.IntervalValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.ListValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.GeonameValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.LinkValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.UriValue">{{ value.strval }}</ng-container>
  </ng-container>`,
})
export class SwitchValuesComponent implements OnInit {
  @Input() value: ReadValue;

  readonly constants = Constants;

  get booleanValue() {
    return this.value as ReadBooleanValue;
  }

  ngOnInit() {
    console.log(this.value);
  }
}
