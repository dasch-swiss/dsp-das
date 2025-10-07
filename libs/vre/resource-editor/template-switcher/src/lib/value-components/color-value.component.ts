import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-color-value',
  template: `
    <app-nullable-editor [formControl]="control" [defaultValue]="'#000000'">
      <div
        #colorPickerTrigger="ngxColorPicker"
        [colorPicker]="control.value ?? DEFAULT_COLOR"
        [cpOutputFormat]="'hex'"
        [cpToggle]="true"
        [cpSaveClickOutside]="false"
        [cpFallbackColor]="DEFAULT_COLOR"
        [cpDialogDisplay]="'inline'"
        [cpUseRootViewContainer]="true"
        (colorPickerChange)="onColorChange($event)"></div>
    </app-nullable-editor>

    @if (control && control.errors; as errors) {
      <mat-error>
        {{ errors | humanReadableError }}
      </mat-error>
    }
  `,
  standalone: false,
})
export class ColorValueComponent {
  readonly DEFAULT_COLOR = '#ff0000';
  @Input({ required: true }) control!: FormControl<string | null>;

  onColorChange(color: string) {
    this.control.setValue(color);
    this.control.markAsTouched();
    this.control.markAsDirty();
  }
}
