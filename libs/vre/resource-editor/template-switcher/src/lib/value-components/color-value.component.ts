import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { HumanReadableErrorPipe } from '@dasch-swiss/vre/ui/string-literal';
import { ColorPickerModule } from 'ngx-color-picker';
import { NullableEditorComponent } from '../nullable-editor.component';

@Component({
  selector: 'app-color-value',
  template: `
    <app-nullable-editor [formControl]="control" [defaultValue]="'#000000'">
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
    </app-nullable-editor>
    @if (control.touched && control.errors; as errors) {
      <mat-error>
        {{ errors | humanReadableError }}
      </mat-error>
    }
  `,
  styles: [
    `
      :host {
        z-index: 1;
        position: relative;

        ::ng-deep .mat-mdc-form-field-subscript-wrapper {
          display: none !important;
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    NullableEditorComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    ColorPickerModule,
    MatError,
    HumanReadableErrorPipe,
  ],
})
export class ColorValueComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
}
