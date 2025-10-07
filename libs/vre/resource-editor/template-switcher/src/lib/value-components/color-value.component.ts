import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ColorPickerDirective } from 'ngx-color-picker';

@Component({
  selector: 'app-color-value',
  template: `
    <app-nullable-editor [formControl]="control" [defaultValue]="'#000000'">
      <div
        #colorPickerTrigger="ngxColorPicker"
        #triggerDiv
        [colorPicker]="control.value ?? '#ff0000'"
        [cpOutputFormat]="'hex'"
        [cpToggle]="true"
        [cpSaveClickOutside]="false"
        [cpFallbackColor]="'#ff0000'"
        [cpDialogDisplay]="'inline'"
        [cpUseRootViewContainer]="true"
        (colorPickerChange)="onColorChange($event)"
        style="position: fixed; top: 0; left: 0; height: 0; width: 0;"></div>
    </app-nullable-editor>

    @if (control && control.errors; as errors) {
      <mat-error>
        {{ errors | humanReadableError }}
      </mat-error>
    }
  `,
  styles: [``],
  standalone: false,
})
export class ColorValueComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
  @ViewChild('colorPickerTrigger') colorPickerDirective?: ColorPickerDirective;
  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('triggerDiv') triggerDiv?: ElementRef<HTMLDivElement>;

  onColorChange(color: string) {
    this.control.setValue(color);
    this.control.markAsTouched();
    this.control.markAsDirty();
  }
}
