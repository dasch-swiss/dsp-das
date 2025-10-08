import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  template: `
    <div
      matTooltip="Click to select color"
      #colorPickerTrigger="ngxColorPicker"
      [colorPicker]="value ?? defaultColor"
      [cpOutputFormat]="'hex'"
      [cpToggle]="true"
      [cpSaveClickOutside]="false"
      [cpFallbackColor]="defaultColor"
      [cpDialogDisplay]="'inline'"
      [cpUseRootViewContainer]="true"
      (colorPickerChange)="onColorChange($event)"></div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() defaultColor = '#ff0000';

  value: string | null = null;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  onColorChange(color: string) {
    this.value = color;
    this.onChange(color);
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
