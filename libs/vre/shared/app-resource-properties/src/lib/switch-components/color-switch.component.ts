import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-color-switch',
  template: `
    <ng-container *ngIf="displayMode; else editMode">
      <div style="width: 50px; height: 20px" data-cy="color-box" [style.background-color]="control.value"></div>
    </ng-container>
    <ng-template #editMode>
      <mat-form-field appearance="outline" style="cursor: pointer">
        <mat-label>{{ control.value }}</mat-label>
        <!-- check the ngx-color-picker doc to know more about the options - https://www.npmjs.com/package/ngx-color-picker -->
        <input
          data-cy="color-picker-input"
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
      </mat-form-field>
    </ng-template>
  `,
  styles: [':host { z-index: 1}'], // for color picker popup z-index
})
export class ColorSwitchComponent implements IsSwitchComponent {
  @Input() control!: FormControl<string>;
  @Input() displayMode = true;
}
