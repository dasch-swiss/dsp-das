import { Component, Input } from '@angular/core';
import { Constants, ReadValue } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-values',
  template: ` <ng-container [ngSwitch]="value.type">
    <ng-container *ngSwitchCase="constants.IntValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.DecimalValue">{{ value.strval }}</ng-container>
    <ng-container *ngSwitchCase="constants.BooleanValue">
      <mat-slide-toggle [checked]="true"></mat-slide-toggle>
    </ng-container>
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
export class SwitchValuesComponent {
  @Input() value: ReadValue;

  readonly constants = Constants;
}
