import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-color-value-2',
  template: ` <mat-form-field appearance="outline" style="cursor: pointer">
    <mat-label>{{ control.value }}</mat-label>
    <!-- check the ngx-color-picker doc to know more about the options - https://www.npmjs.com/package/ngx-color-picker -->
    <input
      matInput
      placeholder="Select a color"
      class="color-picker-input color"
      [formControl]="control"
      [colorPicker]="control.value"
      [style.background]="control.value"
      [style.color]="control.value"
      (colorPickerChange)="control.patchValue($event)"
      [cpOutputFormat]="'hex'"
      [cpFallbackColor]="'#ff0000'"
      [cpDisabled]="false"
      style="cursor: pointer"
      readonly />
  </mat-form-field>`,
  styles: [':host { z-index: 1}'], // for color picker popup z-index
})
export class ColorValue2Component {
  @Input() control!: FormControl<string>;
}
