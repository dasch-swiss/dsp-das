import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  template: `
    <fieldset class="color-picker-fieldset">
      <legend>Select a color</legend>
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
    </fieldset>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
  styles: [
    `
      .color-picker-fieldset {
        border: 0.1rem solid currentColor;
        border-radius: 0.5rem;
        padding: 1rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .color-picker-fieldset legend {
        padding: 0 0.5rem;
      }
    `,
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
